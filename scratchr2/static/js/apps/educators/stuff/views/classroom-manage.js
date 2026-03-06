/* View to display a single classroom tab
 */

Scratch.EducatorStuff.ClassroomManageView = Backbone.View.extend({
  template: _.template($('#template-classroom').html()),
  className: 'classroom-manage-content',
  events: {
    'click [data-control="close-classroom"]' : 'closeConfirm',
  },

  initialize: function() {
    this.template = this.options.template || this.template;
    this.model.on('destroy', this.close, this);

    // bind all success & error functions in order to ensure correct context
    _.bindAll(this, "closed", "closeClassroom");
  },
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));

    this.descriptionEditView = new Scratch.EducatorStuff.EditClassroomText({el: $('#bio'), model: this.model, charsLeftSelector: '#bio-chars-left'});
    this.statusEditView = new Scratch.EducatorStuff.EditClassroomText({el: $('#status'), model: this.model, charsLeftSelector: '#status-chars-left'});
    this.thumbnailEditView = new Scratch.EducatorStuff.EditClassroomThumbnail({el: this.$('.avatar'), model: this.model});

    return this;
  },
  closeConfirm: function(e) {
    e.preventDefault();
    this.confirmModal('close');
  },
  confirmModal: function(action) {
    var $confirmModal = $('#classroom-confirm-modal');
    // Init modal dialog with the correct underscore template and set vars
    switch(action) {
      case 'close':
        $confirmModal.html(_.template($('#template-close-class-dialog').html(), this.model.toJSON()));
        var $button = $('button[data-control="close_class"]', $confirmModal);
        var actionFunction = this.closeClassroom;
        break;
    }

    $confirmModal.modal('show');

    var self = this;
    var $ajaxLoader = $('.ajax-loader', $confirmModal);
    var $badPassword =  $('.password-mismatch-text', $confirmModal);

    // click handler for the delete button
    $button.click(function( event ) {
      $('.password-match-text', $confirmModal).hide();
      $('.password-mismatch-text', $confirmModal).hide();
      $('.ajax-loader', $confirmModal).show();
      var url = '/site-api/classrooms/check_educator_password/';
      var args = {
            'password': $('input[name="password"]', $confirmModal).val(),
      };

      $.ajax(url, {type: 'POST', data: JSON.stringify(args), dataType: 'json',
        success: function(response) {
          if(response.success){
            $ajaxLoader.hide();
            $badPassword.hide();
            actionFunction();
          }
          else {
            $ajaxLoader.hide();
            $badPassword.html(Scratch.ALERT_MSGS[response.errors[0]]);
            $badPassword.show();
          }
        },
        error: function(response) {
          $ajaxLoader.hide();
          var error = Scratch.ALERT_MSGS['error'];
          if (response.errors) {
            if (response.errors[0] && typeof Scratch.ALERT_MSGS[response.errors[0]] !== 'undefined') {
              error = Scratch.ALERT_MSGS[response.errors[0]];
            }
          }
          $badPassword.html(error);
          $badPassword.show();
        }
      });
    });
  },
  closeClassroom: function(){
    var url = '/site-api/classrooms/close_classroom/' + this.model.id + '/';
    var model = this.model;

    $.post(url, this.closed);
  },
  closed: function(response) {
    if(response.success){
      $('#classroom-confirm-modal').modal("hide");
      $(this.el).fadeOut();
      Scratch.EducatorStuff.EventMgr.trigger('success-message', Scratch.ALERT_MSGS['classroom-closed']);
      Scratch.EducatorStuff.EventMgr.trigger('classroom-closed', this.model.id);
    }
    else {
      Scratch.EducatorStuff.EventMgr.trigger('error-message', Scratch.ALERT_MSGS['error']);
    }
  },
  close: function() {
    $(this.el).unbind();
    $(this.el).remove();
  }
});

// Edit text fields
Scratch.EducatorStuff.EditClassroomText = Scratch.EditableTextField.extend({
  initialize: function(attributes, options) {
    Scratch.EditableTextField.prototype.initialize.apply(this, [options]);
    this.charsLeftSelector = this.options.charsLeftSelector;
    var self = this;

    self.$('textarea')
    .on('focusin',function(){
      self.$(self.charsLeftSelector).text(200-self.$('textarea').val().length);
      self.$(self.charsLeftSelector).parent().show();
    })
    .on('focusout',function(){
      self.$(self.charsLeftSelector).parent().hide();
    })
    .limit('200',self.charsLeftSelector);
  },

  onEditSuccess: function(data) {
    Scratch.AlertView.msg($('#alert-view'), {alert: 'success', msg: Scratch.ALERT_MSGS['change-saved'] });
  },
  error: function(model,xhr,options) {
    // Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: xhr.responseText||xhr.statusText });
    // no visible alert since this fires if the page is unloading, even when there is a server side success.
    throw 'in Scratch.EditableTextField, error - responseText:' + xhr.responseText + '  status:'+xhr.status;
  },
});

Scratch.EducatorStuff.EditClassroomThumbnail = Backbone.View.extend({
  template: _.template($('#template-classroom-thumbnail').html()),

  events: {
    'mouseover': 'showEdit',
    'mouseout': 'hideEdit',
    'change input[type="file"]': 'submit',
  },
  initialize: function() {
    _.bindAll(this, 'imageUploadStart');
    _.bindAll(this, 'imageUploadSuccess');

    this.$el.fileupload({
      url: this.model.url(),
      done: this.imageUploadSuccess,
      start: this.imageUploadStart,
    });
  },

  showEdit: function(e) {
    this.$el.addClass('edit');
  },

  hideEdit: function(e) {
    this.$el.removeClass('edit');
  },

  imageUploadSuccess: function(event, xhr) {
    this.$el.removeClass('loading');
    if (xhr.result.error) {
      Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: xhr.result.error});
    }
    else {
      var new_src = this.$('img').attr('src') + '?' + new Date().getTime(); // unique hash param to force refresh
      this.$('img').attr('src', new_src);
      Scratch.EducatorStuff.EventMgr.trigger('success-message', Scratch.ALERT_MSGS['change-saved']);
    }
  },

  imageUploadStart: function() {
    this.$el.removeClass('edit');
    this.$el.addClass('loading');
  },

  submit: function(e) {
  },

});

// Edit text fields
Scratch.EducatorStuff.EditClassroomCheckbox = Scratch.EditableCheckboxField.extend({
  initialize: function(attributes, options) {
    Scratch.EditableCheckboxField.prototype.initialize.apply(this, [options]);
    var self = this;
  },
  /*saveEditable: function(e) {
    // override because the Public/Private checkbox on the manage tab reverses
    // standard checkbox behavior:
    // Checked (i.e. PUBLIC) = 0
    // Unchecked (i.e. PRIVATE) = 1
    var changes = {};
    changes[this.eField.name] = (this.$eField.is(':checked') ? 0 : 1);
    this.serverCall(changes);
  },*/
  onEditSuccess: function(data) {
    Scratch.EducatorStuff.EventMgr.trigger('success-message', Scratch.ALERT_MSGS['change-saved']);
  },
  error: function(model,xhr,options) {
    // Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: xhr.responseText||xhr.statusText });
    // no visible alert since this fires if the page is unloading, even when there is a server side success.
    throw 'in Scratch.EditableSelectField, error - responseText:' + xhr.responseText + '  status:'+xhr.status;
  },
});


//
// $('#element').donetyping(callback[, timeout=1000])
// Fires callback when a user has finished typing. This is determined by the time elapsed
// since the last keystroke and timeout parameter or the blur event--whichever comes first.
//   @callback: function to be called when even triggers
//   @timeout:  (default=1000) timeout, in ms, to to wait before triggering event if not
//              caused by blur.
// Requires jQuery 1.7+
//
// FROM: http://stackoverflow.com/questions/14042193/how-to-trigger-an-event-in-input-text-after-i-stop-typing-writing
//
;(function($){
    $.fn.extend({
        donetyping: function(callback,timeout){
            timeout = timeout || 1e3; // 1 second default timeout
            var timeoutReference,
                doneTyping = function(el){
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function(i,el){
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress',function(e){
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too premptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type=='keyup' && e.keyCode!=8) return;

                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function(){
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur',function(){
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });
})(jQuery);
