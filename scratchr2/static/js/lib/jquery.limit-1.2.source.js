(function($){ // AL 2013-02-06 12:49 PM Rewritten to work faster, cross-browser, and return jQuery like a standard $.fn plugin.
  $.fn.limit = function(limit,msgElemSelector) {
    return this.each(function(){
      var $input = $(this),
          $msgElem = $(msgElemSelector),
          evtName = this.oninput === undefined ? 'keyup mouseup':'input';
      $input.on(evtName,function(e){
        var val = $input.val(),
            charsLeft = limit-val.length;
        if(charsLeft < 1) {
          $input.val(val.substring(0,limit));
          $msgElem.addClass('limit-warning').text(0);
        } else {
          $msgElem.removeClass('limit-warning').text(charsLeft);
        }
      });
    });
  }
})(jQuery);
