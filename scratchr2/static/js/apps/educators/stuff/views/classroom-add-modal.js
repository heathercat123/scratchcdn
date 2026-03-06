Scratch.EducatorStuff.ClassroomAddModalView=Scratch.EducatorStuff.ClassroomStudentModalView.extend({
  events:{
     'blur .title': 'validateClassroomTitle',
     'keydown .title': 'clear',
     'click .modal-footer .button[type="submit"]': 'submit',
     'click [data-dismiss="modal"]': 'dismiss',
  },

  modalUrl: '/classes/add_classroom_modal/',
  postUrl: '/classes/create_classroom/',
  type: 'classroom',

  validateClassroomTitle: function(e) {
    var title = this.$('.title').val();
    if ((!title.length && !e) || title.length == 0) {
      this.addError('title', Scratch.AddClassroom.FORM_ERRORS['title-required']);
    }
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
  validateFields: function() {
    this.clearErrors();
    this.validateClassroomTitle();
  },
  submit: function(e) {
    this.validateFields();
    e.preventDefault();
    // move to the next page
    if (!this.hasErrors()) {
      this.$('.modal-footer .ajax-loader').show();
      this.$('input[type=submit]').addClass('disabled');
      var self = this;
      $.withCSRF(function(csrf) {
        $.ajax({
          data: JSON.stringify({
            title: self.$('.title').val(),
            description: self.$('.description').val(),
            status: '',
            is_robot: self.$('input[name="yesno"]:checked').length > 0,
            should_generate_admin_ticket: self.$('.should-generate-admin-ticket').val(),
            usernames_and_messages: self.$('.usernames-and-messages').val(),
            csrfmiddlewaretoken: csrf,
          }),
          dataType: 'json',
          url: self.postUrl,
          type: 'post',
          success: self.onSubmit,
          error: self.onError,
        });
      });
      return;
    }
  },
  onSubmit: function(response) {
    this.$('.modal-footer .ajax-loader').hide();
    if (response[0].success) {
      this.clearErrors();
      self.$('.title').val('');
      self.$('.description').val('');
      this.dismiss();
      Scratch.EducatorStuff.EventMgr.trigger('success-message', "Class successfully added.");
      // trigger the classroom-added event with the id of the newly constructed classroom
      Scratch.EducatorStuff.EventMgr.trigger('classroom-added', response[0].id);
    }
  },
  onError: function(response) {
    this.clearErrors();
    this.$('.modal-footer .ajax-loader').hide();
    if (response.status === 400) {
      $.each(response.responseJSON[0].errors, function (field, value) {
        if (value in Scratch.ALERT_MSGS) {
          this.addError(field, Scratch.AddClassroom.FORM_ERRORS[value]);
        } else {
          this.addError(field, value);
        }
      }.bind(this));
    } else {
       _gaq.push(['_trackEvent', 'registration', 'register-step-oh-noes-ajax-error']);
      this.ohNoesPage()
    }
  },
});
