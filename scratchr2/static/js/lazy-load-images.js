// Function for loading images as they appear on the screen, to speed up page loads
// Required files: jquery, jquery.lazyload.min.js

/*
 * options (
 *   container: The container block for the img tags, identified by id or class. 
 *              For example, $(".scroll-content").
 *   threshold: The number of pixels away from the screen at which the image should load
 *   effect:    A image animation, like fadeIn.
 * )
 */
function initialize_lazyload(options) {
  var default_options = {
    threshold: 0,
  };

  if (typeof options === "undefined") {
    options = default_options;
  } else {
    for (key in default_options) {
      if (default_options.hasOwnProperty(key)) {
        if (!options.hasOwnProperty(key)) {
          options.key = default_options.key;
        }
      } 
    }
  }
  
  //Requires that the class "lazy" for the img tag
  $("img.lazy").lazyload(options);
}

//Load images as they appear instead of on page load.
//First call: handle horizontal scrolling within the ".scroll-content" container
$(".scroll-content").each(function(index) {
  initialize_lazyload({container: $(this)});
});

//In case there are no scroll-content containers
initialize_lazyload();