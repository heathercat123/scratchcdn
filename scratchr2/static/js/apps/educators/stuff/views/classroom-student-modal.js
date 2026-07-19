Scratch.EducatorStuff.ClassroomStudentModalView=Backbone.View.extend({
  events:{
     'blur .username': 'validateUsername',
     //'blur .password': 'validatePassword',
     //'blur .email': 'validateEmail',
     'keydown .username': 'clear',
     //'keydown .password': 'clear',
     //'keydown .email': 'clear',
     'click .piiConfirm': 'clear',
     'click .pii-confirm-text': 'togglePIIConfirm',
     'click .modal-footer .button[type="submit"]': 'submit',
     'click [data-dismiss="modal"]': 'dismiss',
     'change select[name="classroom_id"]': 'resetAlertError',
  },

  modalUrl: '/classes/register_student_modal/',
  postUrl: '/classes/register_new_student/',
  type: 'students',

  initialize: function() {
    var self = this;
    this.$el.load(this.modalUrl, function(data) {self.initData(data)});

    _.bindAll(this, 'onSubmit');
    _.bindAll(this, 'onError');
    _.bindAll(this, 'ohNoesPage');
    _.bindAll(this, 'resetAlertError');
  },

  initData: function(data) {
    self = this;
    // hide error section at bottom
    this.$('.reg-body-oh-noes').hide();
    // put focus on the first field
    setTimeout(function() {self.$('select:first').focus();}, 200);
  },

  hasErrors: function() {
    if (this.$('.modal-body .error').length == 0) {
      return false;
    }
    return true;
  },

  clear: function(e) {
    $(e.target).parents('.controls.error').removeClass('error')
    //$(e.target).parents('.control-group').find('.error').html('');
    //this.$('#reg-body-' + this.step + ' .error').removeClass('error');
  },

  togglePIIConfirm: function(e) {
    var piiConfirm = this.$('.piiConfirm')[0];
    if (piiConfirm) {
      piiConfirm.checked = !piiConfirm.checked;
    }
    self.clear(e); // also clear errors on this element
  },

  resetAlertError: function(e) {
    const $alertErrorText = this.$('[data-content="alert-error"] .text');
    $alertErrorText.html('');
    this.$('.reg-body-oh-noes').hide();
  },

  validateUsername: function(e) {
    var username = this.$('.username').val();
    var flag = false; // true if there are any errors in the username
    var $usernameError = this.$('[data-content="username-error"] .text');

    if (!username.length) {
      $usernameError.html(Scratch.StudentRegistration.FORM_ERRORS['usernameEmpty']);
      flag = true;
    }

    if (username.length) {
      if(username.length < 3 || username.length > 20) {
        $usernameError.html(Scratch.StudentRegistration.FORM_ERRORS['usernameLength']);
        flag = true;
      }
      else if (!(/^[a-zA-Z0-9_-]+$/).test(this.$('.username').val())) {
        $usernameError.html(Scratch.StudentRegistration.FORM_ERRORS['usernameCharacters']);
        flag = true;
      }
      // verify with the server that the username isn't taken
      if (!flag) {
        var self = this;
        $.ajax({
          url: '/accounts/check_username/' + username + '/',
          success: function(response) {
            var msg = response[0].msg;
            if (msg == 'username exists') {
              $usernameError.html(Scratch.StudentRegistration.FORM_ERRORS['usernameExists']);
              flag = true;
            } else if (msg == 'bad username') {
              $usernameError.html(Scratch.StudentRegistration.FORM_ERRORS['usernameBad']);
              _gaq.push(['_trackEvent', 'registration-bad-usernames', username]);
              flag = true;
            } else if (msg == 'invalid username') {
              $usernameError.html(Scratch.StudentRegistration.FORM_ERRORS['usernameInvalid']);
              flag = true;
            }
          },
          error: function(response) {
            var msg = response[0].msg;
          },
          async: false,
        });
      }
    }

    if (flag) {
      this.$('.username').parents('.controls').addClass('error');
    }
  },

  validatePIIConfirm: function() {
    var piiConfirm = this.$('.piiConfirm')[0];
    var $piiConfirmError = this.$('[data-content="pii-confirm-error"] .text');

    if (!piiConfirm || !piiConfirm.checked) {
      $piiConfirmError.html(Scratch.StudentRegistration.FORM_ERRORS['piiConfirmNotChecked']);
      this.$('.piiConfirm').parents('.controls').addClass('error');
    }
  },

  validatePassword: function(e) {
    var password = this.$('.password').val();
    var flag = false; // true if there were any errors in the password
    var $passwordError = this.$('[data-content="password-error"] .text');

    if (!password.length && !e) {
      $passwordError.html(Scratch.StudentRegistration.FORM_ERRORS['passwordEmpty']);
      flag = true;
    }
    if (password.length) {
      if (password.toLowerCase() == this.$('.control-group .username').val().toLowerCase()) {
        $passwordError.html(Scratch.StudentRegistration.FORM_ERRORS['passwordUsername']);
        flag = true;
      }
      else if (password == 'password') {
        $passwordError.html(Scratch.StudentRegistration.FORM_ERRORS['passwordPassword']);
        flag = true;
      }
      else if (password.length < 6) {
        $passwordError.html(Scratch.StudentRegistration.FORM_ERRORS['passwordLength']);
        flag = true;
      }
    }
    if (flag) {
      this.$('.password').parents('.controls').addClass('error');
    }
  },

  validateEmail: function() {
    var flag = false; // true if there were any errors in email
    var email = this.$('.email').val();
    var $emailError = this.$('[data-content="email-error"] .text');

    if (email.length && !(/\S+@\S+\.\S+/).test(email)) {
      $emailError.html(Scratch.StudentRegistration.FORM_ERRORS['emailInvalid']);
      flag = true;
    }
    if (flag) {
      this.$('.email').parents('.controls').addClass('error')
    }
  },

  validateFields: function() {
    this.validateUsername();
    this.validatePIIConfirm();
  },
  usernameExists: function(response) {

  },
  submit: function(e) {
    this.validateFields();
    e.preventDefault();
    // move to the next page
    if (!this.hasErrors()) {

      this.$('.modal-footer .ajax-loader').show();
      this.$('input[type=submit]').addClass('disabled');
      var self = this;
      // pull the classroom id and token for submission
      this.classroom_id = $('.classroom_id').val();
      var token = $("input[data-token-classroom-id=" + this.classroom_id + "]").val();
      $.withCSRF(function(csrf) {
        $.ajax({
          data: {
            classroom_id: self.classroom_id,
            classroom_token: token,
            username: self.$('.username').val(),
            password: "", // leave password blank since it gets set to the educator's username
            is_robot: self.$('input[name="yesno"]:checked').length > 0,
            should_generate_admin_ticket: self.$('.should-generate-admin-ticket').val(),
            usernames_and_messages: self.$('.usernames-and-messages').val(),
            csrfmiddlewaretoken: csrf,
          },
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
    if (response[0].success) {
      this.dismiss();
      //Scratch.EducatorStuff.EventMgr.trigger('success-message', "Student successfully added.");
      //Scratch.EducatorStuff.EventMgr.trigger('student-added');
      this.refreshPage();
    } else {
      _gaq.push(['_trackEvent', 'registration', 'register-step-oh-noes-no-success-' + response[0].msg]);
      this.onError(response);
    }
  },
  onError: function(response) {
    this.$('.modal-footer .ajax-loader').hide();
     _gaq.push(['_trackEvent', 'registration', 'register-step-oh-noes-ajax-error']);
    this.ohNoesPage(response);
  },
  ohNoesPage: function(response) {
    if (response[0]) {
      this.$('[data-content="alert-error"] .general-text').html(Scratch.ALERT_MSGS['error']);
      var $specificTextElem = this.$('[data-content="alert-error"] .specific-text');
      const errors = response[0].errors;
      // if there is at least one error with the string value "too many students"...
      if (errors && Object.keys(errors).some(key => (errors[key].includes("too many students")))) {
        // show the 'classFull' error message
        $specificTextElem.html(Scratch.StudentRegistration.FORM_ERRORS['classFull']);
      } else {
        $specificTextElem.html(response[0].msg);
      }
      this.$('.reg-body-oh-noes').show();
    }
  },
  dismiss: function(e) {
    this.$el.parent('.modal').modal('hide');
  },
  refreshPage: function(){
      // redirect the Educator to the students tab of the classroom that
      // they just registered a student for.
      // TODO:  use backbone & JS to refresh student related DOM instead of
      //        doing a full refresh
      var hash = '#/classroom/' + this.classroom_id +'/' + this.type;
      if(window.location.hash == hash){
        window.location.reload();
      }
      else {
        window.location.replace(window.location.origin + window.location.pathname + hash);
      }
  }
});

