$(function(){
  $.extend($.ui.dialog.prototype.options, {
    resizable: false,
    modal: true,
    dialogClass: 'jqui-modal',
    closeText: 'x',
    create: function( event, ui ) {
        $(this).parent().append('<iframe class="iframeshim" frameborder="0" scrolling="no"></iframe>');
    }
  });
});
