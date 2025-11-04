// AL not going in /js/lib since I hacked it for scratch carousels
/*
 * Tiny Scrollbar 1.8
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Copyright 2012, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 26 / 07 / 2012
 * Depends on library: jQuery
 * 
 * AL - Also depends on jQuery mousewheel
 * Modified to use namespaces $.tiny180 and $.fn.tinyscrollbar180
 *
 */
( function( $ ) 
{
    $.tiny180 = $.tiny180 || { };

    $.tiny180.scrollbar = {
        options: {
                axis       : 'y'    // vertical or horizontal scrollbar? ( x || y ).
            ,   wheel      : 40     // how many pixels must the mouswheel scroll at a time.
            ,   scroll     : true   // enable or disable the mousewheel.
            ,   lockscroll : true   // return scrollwheel to browser if there is no more content.
            ,   size       : 'auto' // set the size of the scrollbar to auto or a fixed number.
            ,   sizethumb  : 'auto' // set the size of the thumb to auto or a fixed number.
            // AL added endCallback function to test and switch arrow colors when resizing done
            ,   endCallback: function(){} // AL added
        }
    };

    $.fn.tinyscrollbar180 = function( params )
    {
        var options = $.extend( {}, $.tiny180.scrollbar.options, params );
        
        this.each( function()
        { 
            $( this ).data('tsb', new Scrollbar( $( this ), options ) ); 
        });

        return this;
    };

    $.fn.tinyscrollbar180_update = function(sScroll)
    {
        return $( this ).data( 'tsb' ).update( sScroll ); 
    };

    function Scrollbar( root, options )
    {
        var oSelf       = this
        ,   oWrapper    = root
        ,   oViewport   = { obj: $( '.viewport', root ) }
        ,   oContent    = { obj: $( '.scroll-content', root ) } // AL switched '.overview' to '.scroll-content'
        ,   oScrollbar  = { obj: $( '.scrollbar', root ) }
        ,   oTrack      = { obj: $( '.track', oScrollbar.obj ) }
        ,   oThumb      = { obj: $( '.handle', oScrollbar.obj ) } // AL switched '.thumb' to 'handle'
        ,   sAxis       = options.axis === 'x'
        ,   sDirection  = sAxis ? 'left' : 'top'
        ,   sSize       = sAxis ? 'Width' : 'Height'
        ,   iScroll     = 0
        ,   previScroll // added to check whether whether we're at the end of a carousel - AL
        ,   iPosition   = { start: 0, now: 0 }
        ,   iMouse      = {}
        ,   touchEvents = ( 'ontouchstart' in document.documentElement ) ? true : false
        ;

        function initialize()
        {
            oSelf.update();
            setEvents();

            return oSelf;
        }

        this.update = function( sScroll )
        {
            oViewport[ options.axis ] = oViewport.obj[0][ 'offset'+ sSize ];
            oContent[ options.axis ]  = oContent.obj[0][ 'scroll'+ sSize ];
            oContent.ratio            = oViewport[ options.axis ] / oContent[ options.axis ];

            oScrollbar.obj.toggleClass( 'disable', oContent.ratio >= 1 );

            oTrack[ options.axis ] = options.size === 'auto' ? oViewport[ options.axis ] : options.size;
            oThumb[ options.axis ] = Math.min( oTrack[ options.axis ], Math.max( 0, ( options.sizethumb === 'auto' ? ( oTrack[ options.axis ] * oContent.ratio ) : options.sizethumb ) ) );
        
            oScrollbar.ratio = options.sizethumb === 'auto' ? ( oContent[ options.axis ] / oTrack[ options.axis ] ) : ( oContent[ options.axis ] - oViewport[ options.axis ] ) / ( oTrack[ options.axis ] - oThumb[ options.axis ] );
            
            iScroll = ( sScroll === 'relative' && oContent.ratio <= 1 ) ? Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll )) : 0;
            iScroll = ( sScroll === 'bottom' && oContent.ratio <= 1 ) ? ( oContent[ options.axis ] - oViewport[ options.axis ] ) : isNaN( parseInt( sScroll, 10 ) ) ? iScroll : parseInt( sScroll, 10 );
            
            setSize();
        };

        function setSize()
        {
            var sCssSize = sSize.toLowerCase();

            oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
            oContent.obj.css( sDirection, -iScroll );
            iMouse.start = oThumb.obj.offset()[ sDirection ];

            oScrollbar.obj.css( sCssSize, oTrack[ options.axis ] );
            oTrack.obj.css( sCssSize, oTrack[ options.axis ] );
            oThumb.obj.css( sCssSize, oThumb[ options.axis ] );
        }

        function setEvents()
        {
            if( ! touchEvents )
            {
                oThumb.obj.bind( 'mousedown', start );
                oTrack.obj.bind( 'mouseup', drag );
            }
            else
            {
                oViewport.obj[0].ontouchstart = function( event )
                {   
                    if( 1 === event.touches.length )
                    {
                        start( event.touches[ 0 ] );
                        event.stopPropagation();
                    }
                };
            }

            if( options.scroll) oViewport.obj.mousewheel(wheel);
            // replaced all this with jQuery mousewheel plugin, which passes clearer params
            // if( options.scroll && window.addEventListener )
            // {
                // AL changed mousewheel carousel scrolling from whole carousel element to just viewport
                // oViewport.obj[0].addEventListener( 'DOMMouseScroll', wheel, false ); 
                // AL changed mousewheel carousel scrolling from whole carousel element to just viewport
                // oViewport.obj[0].addEventListener( 'mousewheel', wheel, false );
            // }
            // else if( options.scroll )
            // {
                // AL changed mousewheel carousel scrolling from whole carousel element to just viewport
                // oViewport.obj[0].onmousewheel = wheel;
            // }
        }

        function start( event )
        {
            var oThumbDir   = parseInt( oThumb.obj.css( sDirection ), 10 );
            iMouse.start    = sAxis ? event.pageX : event.pageY;
            iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
            
            if( ! touchEvents )
            {
                $( document ).bind( 'mousemove', drag );
                $( document ).bind( 'mouseup', end );
                oThumb.obj.bind( 'mouseup', end );
            }
            else
            {
                document.ontouchmove = function( event )
                {
                    event.preventDefault();
                    drag( event.touches[ 0 ] );
                };
                document.ontouchend = end;        
            }
        }

        function wheel( event,delta,deltaX,deltaY ) // event is now fed from jQuery.mousewheel plugin
        {
          if((options.axis==='x' && deltaX===0) || (options.axis==='y' && deltaY===0)) return;
          if( oContent.ratio < 1 ) {
              var oEvent = event//|| window.event
              // ,   iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3
              ,   iDelta = delta;
              
              previScroll=iScroll;
              iScroll -= iDelta * options.wheel;
              iScroll = Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll ));

              oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
              oContent.obj.css( sDirection, -iScroll );

              if( options.lockscroll) {
                  // if iScroll changed, there are items left to scroll to, so prevent window scrolling - AL
                if(previScroll!==iScroll){
                  oEvent.preventDefault()
                  options.endCallback()
                }
              }
          }
        }

        function drag( event )
        {
            if( oContent.ratio < 1 )
            {
                if( ! touchEvents )
                {
                    iPosition.now = Math.min( ( oTrack[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( ( sAxis ? event.pageX : event.pageY ) - iMouse.start))));
                }
                else
                {
                    iPosition.now = Math.min( ( oTrack[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( iMouse.start - ( sAxis ? event.pageX : event.pageY ) ))));
                }

                iScroll = iPosition.now * oScrollbar.ratio;
                oContent.obj.css( sDirection, -iScroll );
                oThumb.obj.css( sDirection, iPosition.now );
            }
        }
        
        function end()
        {
            $( document ).unbind( 'mousemove', drag );
            $( document ).unbind( 'mouseup', end );
            oThumb.obj.unbind( 'mouseup', end );
            document.ontouchmove = document.ontouchend = null;
            options.endCallback();
        }

        return initialize();
    }

}(jQuery));