;(function( $ ){
  // define the plugin - see http://docs.jquery.com/Plugins/Authoring
  $.fn.sliderCarousel = function( method ) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.sliderCarousel' );
    }    
  };
  
  var methods={
    init:function(options){
      var orientationMap={
        vertical:{
          len:'height',
          pos:'top'
        }
        ,horizontal:{
          len:'width',
          pos:'left',
        }
      }
      ,defaults={
        carouselEnabled:true,
        sliderEnabled:true,
        viewportClass:".viewport",
        scrollContentClass:".scroll-content",
        scrollBarHTML:'<div class="scrollbar"><div class="track"><div class="handle"><div class="end"></div></div></div></div>',
        leftArrowHTML:'<a class="slider-carousel-control left arrow-left off" href="#" >&#8249;</a>',
        rightArrowHTML:'<a class="slider-carousel-control right arrow-right on" href="#">&#8250;</a>',
        upArrowHTML:'<a class="slider-carousel-control up arrow-up off" href="#">&#x25B2;</a>',
        downArrowHTML:'<a class="slider-carousel-control down arrow-down on" href="#">&#x25BC;</a>',
        easing:'swing',
        duration:800,
      };
            


      return this.each(function(){
        //get the elements
        var D = $.data(this);
        if(D.$el == undefined){
          var el=this
          ,opts=$.extend({},defaults,options)
          ,$el=$(el)
          ,orientation=$el.hasClass('vertical') ? 'vertical':'horizontal'
          ,$scrollContent = $el.find( opts.scrollContentClass )
          ,$viewport=$el.find( opts.viewportClass )
          ,viewportPxSize=$viewport[orientationMap[orientation].len]()
          ,D=$.data(this,$.extend({
            $el : $el
            ,orientation : orientation
            ,$viewport : $viewport
            ,$scrollContent : $scrollContent
            ,lengthName : orientationMap[orientation].len
            ,posName : orientationMap[orientation].pos
            ,$lesserArrow : $(orientation=='vertical'?opts.upArrowHTML:opts.leftArrowHTML)
            ,$greaterArrow : $(orientation=='vertical'?opts.downArrowHTML:opts.rightArrowHTML)
            ,contentOffset : 0
            ,initialOffset : 0
          },opts))
        }

        D.$el.sliderCarousel('setScrollContentSize');

        if(D.scrollingContentPxSize > D.viewportPxSize){ // if the items' width is wider than the containing viewport
          D.$el.addClass('sliderCarousel');
          // initialize the slider
          if(D.sliderEnabled) D.$el.sliderCarousel('initTinyScrollbar');
          // initalize the carousel
          if(D.carouselEnabled) D.$el.sliderCarousel('initTinyCarousel');
        }

      });
    },


    setScrollContentSize:function () {
      return this.each(function(){
        var D=$.data(this);
        D.scrollingContentPxSize=0;
        D.maxItemHeight=0;
        D.maxItemWidth=0;
        var $items= D.$scrollContent.children('.item').each(function(){
          var $item=$(this)
          ,h=$item.outerHeight(true)
          ,w=$item.outerWidth(true);
          if(D.orientation=='vertical'){
            if( D.maxItemWidth < w) D.maxItemWidth = w; // save the max item width for sizing the container
            D.scrollingContentPxSize += h;
          } else{ 
            if( D.maxItemHeight < h) D.maxItemHeight = h; // save the max item height for sizing the container
            D.scrollingContentPxSize += w;
          }
        });
        D.viewportPxSize = D.$viewport[D.lengthName]()
        D.scrollMax = D.scrollingContentPxSize - D.viewportPxSize;

        D.$scrollContent[D.lengthName](D.scrollingContentPxSize) // set the container width to the elements' width
      });
    },

    updateArrows:function(){
      var self = this;
      return this.each(function(){
        var D = $.data(this),
        contentOffset=parseInt(D.$scrollContent.css(D.posName));
        D.$lesserArrow.addClass('off')
        D.$greaterArrow.addClass('off')
        if(contentOffset < D.initialOffset) {
          D.$lesserArrow.removeClass('off')
        } else{
          console.log('minimum reached');
        }
        if(contentOffset > -D.scrollMax) {
          D.$greaterArrow.removeClass('off');
        } else{
          D.$el.trigger('carousel-end');
          console.log('maximum reached');
        }
      })
    },
    
    doubleItems:function () { // debugging function to test ajax load mores
      return this.each(function(){
        var D=$.data(this);
        D.$scrollContent.children('.item').each(function(){
          D.$scrollContent.append($(this).clone());
        });
      });
    },

    updateAll:function (options) { // convenience function to call all updates when scrollbar and carousel active.
      return this.each(function(){
        var D=$.data(this);
        D.$el.sliderCarousel('setScrollContentSize'); // reset the content size
        // update the scrollbar
        D.$el.tinyscrollbar180_update(Math.abs(parseInt(D.$scrollContent.css(D.posName))));
        D.$el.sliderCarousel('updateArrows')
      });
    },

    initTinyScrollbar:function(options){
      //tinyscrollbar
      return this.each(function(){
        var D=$.data(this);

        var tinyScrollBarOptions={
          endCallback:function(){
            return D.$el.sliderCarousel('updateArrows');
          }
        }
        
        // hide the overflow to prevent scrollbars when javascript enabled
        D.$viewport.css( "overflow", 'hidden' );
        D.$scrollContent.css( "overflow", 'hidden' );
        D.$scrollBar=$(D.scrollBarHTML);
        D.$el.append(D.$scrollBar)
      
        if(D.orientation=='vertical'){
          D.$viewport.width(D.maxItemWidth)
          D.$el.width(D.maxItemWidth + D.$scrollBar.outerWidth())
        }else{
          tinyScrollBarOptions.axis='x';
          D.$viewport.height(D.maxItemHeight);
          D.$el.height(D.maxItemHeight + D.$scrollBar.outerHeight());
        }

        D.scrollBarInitialized = true;
        D.$el.tinyscrollbar180(tinyScrollBarOptions)
      })

    },
    
    initTinyCarousel:function(options){
      return this.each(function(){
        var D=$.data(this);
        if(!D.carouselInitialized){ // if we haven't already initialized, do so.
          D.carouselInitialized=true;
          // attach the arrows
          D.orientation=='vertical'?
            D.$viewport.before(D.$lesserArrow).after(D.$greaterArrow):
            D.$viewport.after(D.$lesserArrow,D.$greaterArrow);
          // set events
          D.$lesserArrow.add(D.$greaterArrow).on('click',function(event){ // updates the carousel
            event.preventDefault(); // prevent the click
            event.stopPropagation(); // prevent from triggering events on other elements
            var $arrowEl=$(this);
            $arrowEl.removeClass('on').addClass('off');
            if($arrowEl.hasClass('right')||$arrowEl.hasClass('down')){
              var potentialOffset=parseInt(D.$scrollContent.css(D.posName)) - D.viewportPxSize;
              D.contentOffset = potentialOffset < -D.scrollMax ? -D.scrollMax : potentialOffset;
            } else{
              var potentialOffset=parseInt(D.$scrollContent.css(D.posName)) + D.viewportPxSize;
              D.contentOffset= potentialOffset > D.initialOffset ? D.initialOffset : potentialOffset;
            }
            
            // if(D.orientation=='horizontal')
            var animateProps={}
            ,animateOpts={
              duration:D.duration,
              easing:D.easing,
              complete:function(){
                D.$el.sliderCarousel('updateArrows');
              },
              step:function(ui,event){
                D.$el.tinyscrollbar180_update(Math.abs(parseInt(D.$scrollContent.css(D.posName))));
              },
            };
            
            animateProps[D.posName]=D.contentOffset;
            D.$scrollContent.animate(animateProps, animateOpts);
          })
        }
      })
    }
  }
})( jQuery );
