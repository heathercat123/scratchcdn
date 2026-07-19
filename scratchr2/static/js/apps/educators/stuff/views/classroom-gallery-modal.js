Scratch.EducatorStuff.ClassroomGalleryModalView=Scratch.EducatorStuff.ClassroomStudentModalView.extend({
  events:{
     'blur .title': 'validateStudioTitle',
     'click [data-dismiss="modal"]': 'dismiss',
     'submit form': 'submit'
  },

  modalUrl: '/classes/add_gallery_modal/',
  postUrl: '/classes/create_classroom_gallery/',
  type: 'studios',

  validateStudioTitle: function(e) {
    var $controls = this.$('.title').parents('.controls');
    $controls.removeClass('error');
    var title = this.$('.title').val();
    var flag = false; // true if there were any errors in the password
    var $titleError = this.$('[data-content="title-error"] .text');

    if (!title.length && !e) {
      $titleError.html("This field is required");
      flag = true;
    }
    if (flag) {
      $controls.addClass('error');
    }
    return flag;
  },
  validateFields: function() {
    this.$('.errors').empty().hide();
    var flag = this.validateStudioTitle();
    return flag;
  },
  clearErrors: function () {
    $.each(['title', 'description'], function(i, f) {
      this.$('.' + f).parents('.controls').removeClass('error');
      this.$('[data-content="' + f + '-error"] .text').empty();
    }.bind(this));
  },
  addError: function (field, message) {
    this.$('.' + field).parents('.controls').addClass('error');
    this.$('[data-content="' + field + '-error"] .text').html(message);
  },

  submit: function(e) {
    e.preventDefault();
    const readyForSubmit = $('#add-gallery-modal .add_gallery_modal_ready_for_submit').val();
    if (readyForSubmit !== 'true') {
      return false;
    }
    var hasErrors = this.validateFields();
    // move to the next page
    if (!hasErrors) {
      this.$('.modal-footer .ajax-loader').show();
      this.$('input[type=submit]').addClass('disabled');
      this.classroom_id = $('.classroom_id').val();
      var token = $("input[data-token-classroom-id=" + this.classroom_id + "]").val();
      $.withCSRF(function(csrf) {
        $.ajax({
          data: JSON.stringify({
            classroom_id: self.classroom_id,
            classroom_token: token,
            title: this.$('.title').val(),
            description: this.$('.description').val(),
            csrfmiddlewaretoken: csrf,
          }),
          dataType: 'json',
          url: this.postUrl,
          type: 'post',
          success: this.onSubmit,
          error: this.onError,
        });
      }.bind(this));
    }
  },
  onSubmit: function(response) {
    if (response[0].success) {
      this.dismiss();
      Scratch.EducatorStuff.EventMgr.trigger('success-message', "Studio successfully added.");
      this.refreshPage();
    }
  },
  onError: function(response) {
    this.clearErrors();
    this.$('.modal-footer .ajax-loader').hide();
    // If we can identify errors for specific fields, show them there.
    if (response.status === 400 && response.responseJSON[0]?.errors) {
      $.each(response.responseJSON[0].errors, function (field, value) {
        if (value in Scratch.ALERT_MSGS) {
          const errorMessage = Scratch.AddGallery.FORM_ERRORS[value] || Scratch.ALERT_MSGS[value];
          this.addError(field, errorMessage);
        } else {
          this.addError(field, value);
        }
      }.bind(this));
    } else {
      var error = (response.responseJSON || {}).msg || 'An unidentified error occurred. Please try again.';
      this.$('.modal-footer .ajax-loader').hide();
      this.$('.errors').show();
      this.$('.errors').append('<p>'+error+'</p>');
    }
  },
});
