Scratch.Views = Scratch.Views || {};

Scratch.Views.TipBar = Backbone.View.extend({
  el:'#tip-bar',
  
  events:{
    'click .toggle-control': 'toggle',
    'click #tip-bar-inner.tipsclosed' : 'toggle',
    'click .close-circle-dark' : 'toggle',
    'click .tip-home': 'navToHome',
    // ,'click .tip-back':'back'
    // ,'click .tip-next':'forward'
    'click a': 'navByLink',
    'click .accordion-heading': 'accordionSectionToggled'
  },

  template:_.template($('#template-tip-bar').html()),
  
  initialize:function(){
    this.originalWidth=this.$el.css('width');
    var self=this;
    this.a=this.model.attributes;
    this.setUrlPrefix(Scratch.INIT_DATA.TIPS.CURRENT_LANGUAGE);
    this.$w=$(window);
    window.tip_bar_api={ // define an api for the swf
      open:function(path){ self.open(path); }, // slides the tip bar open and loads a tip
      close:function(){ return self.close(); }, // slides the tip bar closed
      fixIE:function(){ self.fixIE(); }, // fix IE?
      show:function(){ self.show(); }, // shows the tip bar instantly
      hide:function(){ self.$el.hide(); }, // hides the tip bar instantly
      toggle:function(){ self.toggle(); }, // toggles the tip bar sliding open/closed
      load:function(path){ return self.navTo(path); }, // loads a tip without changing open/closed/shown/hidden state
      updateLanguage:function(language){ self.updateLanguage(language); } // reloads the tip bar with a new language
    };
    
    this.$el.html(this.template(this.a)); // putting this here since we're only rendering once
    this.$tipContent=this.$tipContent||this.$el.find('.tip-content');
    this.$tipHeader=this.$tipHeader||this.$el.find('.tip-header');
    this.$tipInner=this.$tipInner||this.$el.find('#tip-bar-inner');
    this.$tipContentContainer=this.$tipContentContainer||this.$tipContent.find('#tip-content-container');

    function reprotocol(hostname){
      // Update the protocol of the hostname to match the current document
      return document.location.protocol + hostname.substr(hostname.indexOf(':')+1)
    }

    this.crossOriginInterface = new Scratch.Views.CrossOriginInterface({
      actor: this.$tipContentContainer.get(0).contentWindow,
      context: self,
      allowed_origins: [reprotocol(Scratch.INIT_DATA.COI.TARGET_DOMAIN)],
      target_domain: reprotocol(Scratch.INIT_DATA.COI.TARGET_DOMAIN)
    });

    var navFromUrlParam = $.urlParam('tip_bar'); 
    var windowWidth = $(window).width();
    this.trackingStarted=$.Deferred(); // defer tracking until the bar is open, since the content first loads while closed.
    
    if(navFromUrlParam && windowWidth >= 1000) {
      this.trackingStarted.resolve();
      this.open(navFromUrlParam,'trackPath') // navigate the tip bar open tip bar to url param
    }
    // snap to correct dimensions
    window.scrollTo(window.pageXOffset, 0);
  },

  fixIE:function(){
    var scroll = window.pageYOffset;
    window.scrollTo(window.pageXOffset, 1 - scroll);
    window.scrollTo(window.pageXOffset, scroll);
  },

  toggle:function(){
    if(this.model.get('isOpen')){
      this.close();
      _gaq.push(['_trackEvent', 'project', 'tip_bar_close' ]);
    } else {
      this.open(this.a.currentTip);
      _gaq.push(['_trackEvent', 'project', 'tip_bar_open' ]);
    }
  },

  open:function(optionalPath){
    var self=this;

    this.trackingStarted.resolve(); // since the bar has opened at least once, start tracking

    if (optionalPath){
      path = this.getPath(optionalPath);
      this.navTo(path);
    } else {
      if (!this.a.currentTip || this.a.currentTip.length == 0) {
        path = this.getPath('home');
        this.navTo(path);
      }
    }

    self.$tipInner.removeClass('tipsclosed').addClass('tipsopen');
    self.$el.animate({width:'321px'},function(){
        self.model.set({isOpen:true})
    });
  },

  close:function(){
    var self=this;
    var wasOpen=this.model.get('isOpen');
    this.model.set({ isOpen:false });
    this.$el.animate({width:this.originalWidth},function(){
        self.$tipInner.removeClass('tipsopen').addClass('tipsclosed');
        try {
          self.crossOriginInterface.post('toggleVideos', [false], null);
        } catch (err) {
          // :)
        }
    });

    return wasOpen;
  },

  show:function(){
    var self=this;
    return self.$el.show()
  },

  navByLink:function(event){
    event.preventDefault();
    // if clicking on a subsection header followed by a non-collapsible
    // header link, prevent the subsection from re-opening on back.
    if($(event.currentTarget).parent().hasClass('accordion-heading')) {
      this.lastClickedSection = null;
    }
    var path = event.currentTarget.pathname;
    if (path[0]!=='/') path = '/' + path;

    _gaq.push(['_trackEvent', 'project', 'tip_bar_close' ]);

    this.navTo(path);
  },

  getPath: function(pathStr) {
    // Gets the url of the tip from the name – either by extension url, or from the tips map.
    var path = '';
    if (pathStr===this.a.currentTip) return pathStr; // return if current tip and potential tip the same;
    if (pathStr.indexOf(this.urlPrefix) === 0) return pathStr; // return if is already a url.

    path = this.a.tipsMap[pathStr] || (pathStr + '.html');

    return this.urlPrefix + path;
  },

  navTo: function(path){ 
    this.trackingStarted.done(function(){ // track tip bar page views as virtual page views once the tip bar has opened
      _gaq.push(['_trackPageview', '/tip-bar'+ path]);
    });
    this.$tipContentContainer.attr('src', '');
    this.$tipContentContainer.attr('src', path);
    this.render();
  },

  navToHome: function(e){
    path = this.getPath('home');
    this.navTo(path);
  },

  setModelPath: function(path) {
    // ensure we're always pushing to the end of a fresh stack in case we
    // "backed" to the middle of the previous stack
    this.a.urlStack=this.a.urlStack.slice(0,this.a.stackPos+1);
    this.model.set({
      currentTip: path,
      // add the path to the stack and get the stack's length as the current position
      stackPos: this.a.urlStack.push(path)-1
    });
  },
  
  accordionSectionToggled:function(e){
    if (e.target.href) return; // if it's a link, do nothing.
    this.$el.find('.expanded').removeClass('expanded').find('span').text('+');
    var $el = $(e.currentTarget);
    this.lastClickedSection = $el.attr('data-target');
    if(!$(this.lastClickedSection).hasClass('in')) $el.addClass('expanded').find('span').text('-');
  },
  
  render:function(){
    // this.$el.find('.tip-next').css('opacity',(this.a.stackPos >= this.a.urlStack.length-1) ? 0.5 : 1 );
    var self = this;
    this.$tipContentContainer.on('load', function() {
      // var $backArrow = self.$el.find('.tip-back')[!(self.a.stackPos<1) ? 'addClass' : 'removeClass']('active');
      if(self.a.currentTip === self.a.tipsMap.home){
        // $backArrow.hide();// hide the back arrow
        if (self.lastClickedSection) {
          window.setTimeout(function(){
            $(self.lastClickedSection).prev().trigger('click');
          },300);
        }
      } else{
        // $backArrow.show()
      }
    });
  },

  setUrlPrefix: function(language) {
    this.urlPrefix = Scratch.INIT_DATA.TIPS.HELP_URLS[language]
  },

  updateLanguage: function(language) {
    var path = '';
    if (this.a.currentTip.indexOf('/') == this.urlPrefix.indexOf('/')){
      // Both are relative by path or protocol
      path = this.a.currentTip.substr(this.urlPrefix.length);
    }else{
      // The urlPrefix is possibly //cdn.jiggler... and the currentTip is http://cdn.jiggler
      path = this.a.currentTip.substr(this.a.currentTip.indexOf(this.urlPrefix)).substr(this.urlPrefix.length);
    }
    this.setUrlPrefix(language);
    if (path){
      this.navTo(this.urlPrefix + path);
    }
  }
});
