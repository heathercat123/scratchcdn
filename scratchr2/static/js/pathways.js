
//Scripts for loading the microworlds landing pages 

//adapted from scratchday/host.js

$(document).ready(function(){
	$(".tips-slider").each( function(){
		$(this).flexslider({
			initDelay: 0, //delay on first animation
			animation: "slide", //fade or slide
			direction: "horizontal",
			animationLoop: true,
			slideshow: false, //if true, animate automatically. May want to change
			slideshowSpeed: 5000, //ms
			animationSpeed: 500, //ms

			//usability features
			pauseOnAction: true, //Pause when interacting with control elements
			pauseOnHover: true, //Pause when hoving over slider
			useCSS: true, //Use CSS 3 is available
			
			itemWidth: 24,
			itemMargin: 0,
			minItems: 1,
			maxItems: 1,
			start: function(slider){
				flexslider = slider;
			},

			//controls
			controlNav: true, //paging control
			directionNav: true, // prev/next controls
			prevText: "", 
			nextText: "",
		});	
	});
});

function JSlogin(action, username){
    var doc = window.parent.document;
    $('#login-dialog', doc).modal('show');
    $('#login-dialog button', doc).show();
    if(username) {
        $('#login-dialog input[name=username]', doc).val(username);
        $('#login-dialog input[name=password]', doc).val('');
        $('#login-dialog input[name=password]', doc).focus();
    }
}
