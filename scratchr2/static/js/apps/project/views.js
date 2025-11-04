var Scratch = Scratch || {};
Scratch.Project=Scratch.Project||{};

Scratch.Project.EditableTextField = Scratch.EditableTextField.extend({
  error: function(model,xhr,options) {
    this.$el.removeClass('loading');
    if (Scratch.INIT_DATA.IS_IP_BANNED) {
        $('#ip-mute-ban').modal();
    }
  },
});

Scratch.Project.EditTitle = Scratch.Project.EditableTextField.extend({
  initialize: function(attributes, options) {
    _.bindAll(this, 'success', 'error', 'saveEditable');
    this.$eField = this.$('textarea');
    this.eField = this.$eField[0];
    this.model.bind('change:title', this.render, this);
    Scratch.EditableTextField.prototype.initialize.apply(this, [options]); 
    if(this.$('input').length) this.$('input').limit('52');
  },

  render: function() {
    this.$('input').val(this.model.get('title'));
  },

});

Scratch.Project.EditNotes = Scratch.Project.EditableTextField.extend({
  initialize: function(attributes, options) {
    _.bindAll(this, 'success', 'error', 'saveEditable');
    this.$eField = this.$('textarea');
    this.eField = this.$eField[0];
    this.$eField
    .on('keyup change', function() {
      if (self.$('textarea').val().length >= 5000) {
        Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: Scratch.ALERT_MSGS['editable-text-too-long']});
      }
    })
    .limit('5000');
  },

  onEditSuccess: function(data) {
    Scratch.AlertView.msg($('#alert-view'), {alert: 'success', msg: Scratch.ALERT_MSGS['notes-changed'] });
    if (this.$eField.val().replace(/^\s+|\s+$/g,'') !== ""){
      this.$el.parents('.tooltip').removeClass("force");
    }else{
      this.$el.parents('.tooltip').addClass("force");
    }
  },
});


Scratch.Project.MarkDraft = Backbone.View.extend({
  events: {
    'click [type="checkbox"]' : "markAsDraft",
  },
  
  markAsDraft: function(e) {
    if ($(e.target).is(':checked')) {
      this.model.related.tags.addItems('work-in-progress');
    } else {
      this.model.related.tags.removeItems('work-in-progress');
    }
    $(e.target).parent('#wip').toggleClass('on');
  },

});

Scratch.Project.AddTags = Scratch.EditableTextField.extend({
  template: _.template('<span class="tag"><a href=""><%= tag %></a> <span data-tag-name="<%= tag %>" data-control="remove">x</span></span>'),
  
  events: { 
    'click [data-control="remove"]': 'removeTag',
    'click': 'showTagDropdown',
    'keydown input.tag-input': 'getKeyPress',
    'click [data-control="add-tag"]': 'addCategory',
  },
  
  initialize: function(attributes, options) {
    _.bindAll(this, 'hideTagDropDown', 'submitTag', 'limitTags','success', 'error', 'saveEditable');
    this.$eField=this.$('input.tag-input');
    this.eField=this.$eField[0];
    $('body').on('click', this.hideTagDropDown); 
    this.adjustInputWidth();
  },
  
  
  adjustInputWidth: function() {
    if (this.$('[data-content="tag-list"]').width() > 350) {  // the active row of tags is full
      if (this.$('[data-content="tag-list"]').height() > 45) { // it has two rows worth of tags
        // create two lists, one for each row
        var topRowTags = $('<div data-content="tag-list-full">');
        var totalWidth = 0;

        this.$('span.tag').each(function(i, tag) { // while there is room on the first row add tags to it
          totalWidth += $(tag).width(); 
          if(totalWidth >= 250) { // top row is full, stop adding tags
            return false;
          }
          topRowTags.append($(tag));
        });
        this.$('[data-content="tag-list"]').before(topRowTags);
      } else if (this.$('[data-content="tag-list"]').width() > 300) { // there are no tags on the second rwo
        this.$('[data-content="tag-list"]').after('<div data-content="tag-list">').removeAttr('data-content');
      }
    }
    else { // there is room on the first row, if the second row exists remove it
      this.$('[data-cotent="tag-list"]').remove()
      this.$('[data-content="tag-list-full"]').removeAttr('data-content').attr('data-content', 'tag-list');
    }
  },

  getKeyPress: function(e) {
    if (this.limitTags(e)) return false;
    if (e.which == 32 || e.which == 188 || e.which == 13 || e.which == 9) { 
      // space entered, comma pressed, enter pressed, tab pressed
      this.addTag();
      e.preventDefault();
    }
  },

  addTag: function() {
    var tag = this.$('input[name="tags"]').val(); 
    tag = tag.replace(/\s+/g, '').replace(/,/g, '');
    this.$('input[name="tags"]').val("");
    if (tag)
      this.submitTag(tag);
  },
  
  addCategory: function(e) {
    this.submitTag($(e.target).data('tag'));
  },

  submitTag: function(tag) {
    var self = this;
    if(!tag) throw 'tag is empty in submitTag.  This should never happen.';
    
    if (!is_tag_valid(tag)) {
      Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: 'Invalid tag "' + _.escape(tag) + '": tags cannot contain punctuation.'});
    } else if (tag.length > 100) {
      Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: Scratch.ALERT_MSGS['editable-text-too-long']});
    } else {
      this.model.addItems(tag,{
        success:function (respObj,responseArray) {
          if (responseArray && responseArray[0] && responseArray[0].isBad){
            return Scratch.AlertView.msg($('#alert-view'), {alert: 'error', timer: 20000, msg: Scratch.ALERT_MSGS['inappropriate-tag'] });
          }
          self.$('[data-content="tag-list"]').append(self.template({tag: tag}));
          self.adjustInputWidth();
          self.$el.removeClass('no-tags').addClass('has-tags'); 
          self.$('.tag-box').removeClass('editable-empty').addClass('editable'); 
          Scratch.AlertView.msg($('#alert-view'), {alert: 'success', msg: Scratch.ALERT_MSGS['tags-changed']});
          self.hideTagDropDown();
        }
      });
    }
  },

  limitTags:function (e) {
    if(this.$('.tag').length>2){
      this.$('.tag-box').stop().css('backgroundColor','#FCC').animate({backgroundColor: "#FFF" },'slow');
      this.$('.tag-input').blur();
      Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: Scratch.ALERT_MSGS['tags-limited']});
      return true;
    }
  },

  showTagDropdown: function(e) {
    if (this.limitTags()) return;
    var self = this;
    this.$('.tag-box').removeClass('read').addClass('write');
    setTimeout(function(){
      self.$('.tag-choices').show();
      self.clearPrompt();
    },0);
  },

  hideTagDropDown: function(e) {
    this.$('.tag-choices').hide();
  },

  removeTag: function(e) {
    var self = this;
    e.stopPropagation();

    this.model.removeItems($(e.target).data('tag-name'), {
      success:function () {
        $(e.target).parent('.tag').remove();
        self.adjustInputWidth();
        if (!self.$('div .tag').length) {
          self.$el.removeClass('has-tags').addClass('no-tags');
          self.$('.tag-box').removeClass('editable').addClass('editable-empty');
        }
       Scratch.AlertView.msg($('#alert-view'), {alert: 'success', msg: Scratch.ALERT_MSGS['tags-changed']});
      }
    });
  },

});


Scratch.Project.UpdateStats = Backbone.View.extend({
  events: {
    'click [data-control="toggle-stat"]': 'toggleStat'
  },
  
  toggleStat: function(e) {
    var $el = $(e.currentTarget);
    var counter = parseInt($el.find('.icon').html());
    var add = $el.data('add');
    var gaqType = $el.data('stat')=='favoriters'?'favorite':$el.data('stat')=='lovers'?'love':'unknown_stat';
    if (add) {
      _gaq.push(['_trackEvent', 'project', gaqType+'_add' ]);
      this.model.related[$el.data('stat')].addItems(Scratch.LoggedInUser.get('username'), {
        error: function (response) {
          var errors = [];
          try {
            errors = response.responseJSON[0].errors;
          } catch (e) {
            errors = ["Something went wrong"];
          }
          if (typeof errors !== 'undefined') {
            Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: errors[0]});
          }
          $el.data('add', true);
          $el.find('.icon').removeClass('on').html(counter);
        }
      });
      $el.data('add', false);
      $el.find('.icon').addClass('on').html(counter +1); 
    } else {
      _gaq.push(['_trackEvent', 'project', gaqType+'_remove' ]);
      this.model.related[$el.data('stat')].removeItems(Scratch.LoggedInUser.get('username'), {
        error: function (response) {
          var errors = [];
          try {
            errors = response.responseJSON[0].errors;
          } catch (e) {
            errors = ["Something went wrong"];
          }
          if (typeof errors !== 'undefined') {
            Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: errors[0]});
          }
          $el.data('add', false);
          $el.find('.icon').addClass('on').html(counter);
        }
      });
      $el.data('add', true);
      $el.find('.icon').removeClass('on').html(counter -1);
    }
  },
});

Scratch.Project.ShareBar = Backbone.View.extend({
  initialize: function() {
    this.model.bind('change:isPublished', this.success, this); // handles case of share from within editor
    _.bindAll(this, 'success');
  },

  events: {
    'submit .share-form': 'preShareProject',
  },
  
  preShareProject: function(e){
    var self = this;
    e.preventDefault();

    if (Scratch.INIT_DATA.IS_IP_BANNED) {
      $('#ip-mute-ban').modal();
      return;
    } else if (Scratch.INIT_DATA.PROJECT.is_permcensored) {
      var reshare_dialog = _.template($('#template-permacensor-reshare-dialog').html());
      $(reshare_dialog()).dialog({
        title: "Cannot Re-Share Project",
        buttons: {
          "Ok": function(){$(this).dialog("close")}
        }
      });
      return;
    } else if (!Scratch.INIT_DATA.IS_SOCIAL) {
      openResendDialogue(); // defined in account-nav.js
      return;
    } else if (Scratch.INIT_DATA.PROJECT.is_censored){
      var reshare_dialog = _.template($('#template-censor-reshare-dialog').html());
      $(reshare_dialog()).dialog({
        title: "Share Project",
        buttons: {
          "Yes, I think it's ok for Scratch now.": function(){
            $(this).dialog("close");
            self.shareProject();
          },
          "Cancel": function(){$(this).dialog("close")}
        }
      });
    } else {
      self.shareProject();
    }
  },

  shareProject: function() {
    if(Scratch.FlashApp.ASobj.AScanShare()) {
      $.ajax({
        type: "POST",
        url: this.model.url() + 'share/',
        success: function () {
          this.model.set({isPublished: true});
          window.location.href = '/projects/' + Scratch.FlashApp.model.get('id') + '/';
        }.bind(this),
        error: function (xhr) {
          return xhr.errorThrown;
        }
      });
    }
    else {
        var self = this;
        self.$el.fadeOut('fast',function(){
            self.$('.public').text('Project cannot be shared because it uses an experimental extension.');
            self.$el.fadeIn('fast');
        });
    }
  },

  success: function() {
    var self = this;
    self.$el.fadeOut('fast',function(){
      self.$('.public').text('Project shared. Reloading to display shared actions.');
      self.$el.fadeIn('fast');
    });
    _.delay(function(){
      location.reload();
    },5000);
  }, 

});

Scratch.Project.Download = Backbone.View.extend({
  events: {
    'click .close': 'close',
  },
  
  open: function() {
    $('.player-box-footer-module').hide();
    this.$el.show().animate({height: '100'});
  },
  
  close: function() {
    this.$el.animate({height: '0'}, function() { $(this).hide() });
  },
  
  toggleOpen: function() {
    if(this.isOpen && this.$el.css('height') > 0)
       this.close();
    else
       this.open();
  },

});

/* The UI for the panel that appears below the project player */
Scratch.Project.AddTo = Backbone.View.extend({
  events: {
    'click .checkmark': 'addProject',
    'click .checkmark-checked': 'removeProject',
    'click .next-page': 'loadMore',
    'click .close': 'close',
  },

  initialize: function(options) {
    _.bindAll(this, 'open');
    this.firstLoadComplete = false;
    this.isOpen = false;
    this.projectId = options.project;
  },
  
  loadMore: function() {
    var nextPageUrl =  this.$el.find('.next-page').data('url') || null;
    var self = this;
    if (nextPageUrl != null) {
      $.ajax({
        url: nextPageUrl + '?project_id=' + this.projectId,
      })
      .always(function(data) { self.$el.find('.next-page').remove()})
      .done(function(data) {
        self.$el.find('ul').append(data);
      });
    } 
  },
  
  addProject: function(e) {
    var galleryId = $(e.target).parent('li').data('studio-id');
    $(e.target).addClass('loading');
    $.ajax({
      url: '/site-api/projects/in/' + galleryId + '/add/?pks=' + this.projectId, 
      type: 'PUT',
    })
    .done(function(data) {
      $(e.target).removeClass('checkmark').addClass('checkmark-checked');
    })
    .always(function(data) {
      $(e.target).removeClass('loading');
    });
  },

  removeProject: function(evt) {
    var studioId = $(evt.target).parents('li').data('studio-id');
    $(evt.target).addClass('loading');
    $.ajax({
      url: '/site-api/projects/in/' + studioId + '/remove/?pks=' + this.projectId, 
      type: 'PUT',
    })
    .done(function(data) {
      $(evt.target).removeClass('checkmark-checked').addClass('checkmark');
    })
    .always(function(data) {
      $(evt.target).removeClass('loading');
    });
  },

  close: function() {
    this.$el.animate({height: '0'}, function() { $(this).hide() });
  },

  open: function() {
    $('.player-box-footer-module').hide();
    if (!this.firstLoadComplete) {this.loadMore()};
    this.$el.show().animate({height: '250'});

  },

  toggleOpen: function() {
    if(this.isOpen && this.$el.attr('data-type') == 'share' && this.$el.css('height') > 0)
          this.close();
      else
          this.open();
  },
});


Scratch.Project.ShareTo = Backbone.View.extend({
  events: {
    'click .close': 'close',
  },

  initialize: function(options) {
    _.bindAll(this, 'open');
    this.isOpen = false;
    this.embedUrl = options.embedUrl;
  },
  
  
  close: function() {
    this.$el.animate({height: '0'}, function() { $(this).hide() });
  },
  
  open: function() {
    $('.player-box-footer-module').hide();
    this.$el.show().animate({height: '250'});
  },
  
  toggleOpen: function() {
    if(this.isOpen && this.$el.attr('data-type') == 'share' && this.$el.css('height') > 0)
          this.close();
      else
          this.open();
  },

  setSize: function(e) {
    var value = $(e.target).val();
    if (value == 'small') {
      this.width = 302;
      this.height = 252;
    } else if (value == 'medium') {
      this.width = 402;
      this.height = 355;
    } else if (value == 'large') {
      this.width = 602;
      this.height = 502;
    }
    this.$('textarea').val(this.embedCode());
  },

  embedCode: function() {
    return '<iframe allowtransparency="true" width="' + this.width + '" height="' + this.height + '" src="' + this.embedUrl + '?auto_start=' + this.autoStart + '" frameborder="0"></iframe>';
  },
});

Scratch.Project.Report = Backbone.View.extend({
  template: _.template($('#template-report').html()),
  
  initialize: function(options) {
    this.isOpen = false;
    this.isSent = false;
  },
  
  events: {
    'click [data-control="close"]' : 'close',
    'click [data-control="submit"]': 'submit',
    'change #report-category-selector': 'changeReportText'
  },
  
  render: function() {
    this.$el.html(this.template());
    this.$el.attr('data-type', 'report');
    if(this.isSent) {
      this.$('div.form').hide();
      this.$('div.message').show();
    }
  },

  changeReportText: function (e) {
    var choice = this.$('select#report-category-selector').val();
    this.$('#report-explanation').attr('placeholder', Scratch.INIT_DATA.PROJECT.reportText[choice]);
  },
  
  close: function() {
    this.$el.animate({height: '0'}, function() { $(this).hide(); });
    this.isOpen = false;
  },

  open: function() {
      $('.player-box-footer-module').hide();
      if(this.$el.css('height') > 0) {
          var self = this;
        this.$el.show().animate({height: '0', complete: function() { self.open(); }});
        this.isOpen = false;
      } else {
        this.render();
        this.$el.show().animate({height: '250'});
        this.isOpen = true;
      }
  },

  toggleOpen: function() {
      if(this.isOpen && this.$el.attr('data-type') == 'report' && this.$el.css('height') > 0)
          this.close();
      else
          this.open();
  },

  isValidReport: function (notes, reportCategory) {
    var isValid = true;
    var errorStr = '';
    if (reportCategory.length === 0) {
      isValid = false;
      errorStr = Scratch.ALERT_MSGS['project-complaint-type'];
    } else if (notes.length < 20) {
      isValid = false;
      errorStr = Scratch.ALERT_MSGS['project-complaint-length'];
    }
    return [isValid, errorStr];
  },

  submit: function() {
    var notes = this.$('textarea').val();
    var reportCategory = this.$('#report-category-selector').val();
    var isValid = this.isValidReport(notes, reportCategory);
    
    if (!isValid[0]) {
      Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: isValid[1]});
      return;
    }

    if (this.$el.data("report-mode") != "moderate") {
      if(!confirm(gettext('Are you sure this project is disrespectful or inappropriate, and breaks the community guidelines? If not, click cancel, and then click the community guidelines link at the bottom of the page to learn more.'))) return;
    }

    if(/\w+/.test(notes)) {

      $.when(window.SWFready)
          .done((function(){
              Scratch.FlashApp.sendReport(
                this.model.url() + 'report/', 
                {notes: notes, report_category: reportCategory});
      }).bind(this));

      this.$('div.form').hide();
      this.$('div.message').show();
      this.isSent = true;
    } else {
        // Clear field and show placeholder again
        // TODO: should we do more?
        this.$('textarea').val("");
    }
  }
});


Scratch.Project.EditView = Backbone.View.extend({
  initialize: function() {
    this.title = new Scratch.Project.EditTitle({el: this.$('#title'), model: this.model});
    this.notes = new Scratch.Project.EditNotes({el: this.$('#description'), model: this.model});
    this.instructions = new Scratch.Project.EditNotes({el: this.$('#instructions'), model: this.model});
    this.isDraft = new Scratch.Project.MarkDraft({el: this.$('#wip'), model: this.model});
    this.stats = new Scratch.Project.UpdateStats({el: this.$('#stats'), model: this.model});
    this.share = new Scratch.Project.ShareBar({el: $('#share-bar'), model: this.model});
    this.addTo = new Scratch.Project.AddTo({el: $('#add-to-menu'), project: Scratch.INIT_DATA.PROJECT.model.id});
    this.addTags = new Scratch.Project.AddTags({el: $('#project-tags'), model: this.model.related.tags});
    this.shareTo = new Scratch.Project.ShareTo({el: $('#share-to-menu'), embedUrl: Scratch.INIT_DATA.PROJECT.embedUrl});
    this.report = new Scratch.Project.Report({el: $('#player-box-footer'), model: this.model});
    this.download = new Scratch.Project.Download({el: $('#download-menu'), model: this.model});
    
    // TODO: Move this somewhere more appropriate
    var iterations = 0;
    setHeight = function(){
    /* resize instructions and notes and credits based on how much room is available in right side panel */
      var parentHeight = $('#instructions').parent().height();
      var childHeight = $('#instructions').height();
      var offset = parentHeight - childHeight;
      if (offset < 0){
        // For some reason the height isn't "ready" for some time
        if (iterations++ < 100){
          setTimeout(setHeight, 10);
        }
        return;
      }
      var dynamicHeight = $("#info").height() - $("#fixed").height();
      $('#instructions, #description').height((dynamicHeight - 2*offset)/2 - 5);
      // there are no instructions, give description the full length
      if (!$('#instructions').length) {
        $('#description').height(dynamicHeight - offset - 10); 
      }
      // add custom scrollbars if we're in read only view
      if ($('#description .viewport').length) {
        $('#instructions, #description').tinyscrollbar();
      }
    }
    setHeight();
  },
  
  events: {
    'click #share-to': 'openShareTo',
    'click #report-this': 'openReport',
    'click #add-to': 'openAddTo',
    'click #download': 'openDownload',
  },

  render: function() {
    //this.thumbnail.render();
  },

  openShareTo: function() {
    this.shareTo.toggleOpen();
  },

  openReport: function() {
    this.report.toggleOpen();
  },
  
  openAddTo: function() {
    this.addTo.toggleOpen();
  },
  
  openDownload: function() {
    this.download.toggleOpen();
  },
  

});

