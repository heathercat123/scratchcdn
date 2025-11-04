Scratch.EducatorStuff.ClassroomStudentHeaderView = Backbone.View.extend({

  events: {
    'click [data-control="register_student"]': 'registerStudentModal',
    'click [data-control="generate_registration_link"]': 'registrationLinkModal',
    'click [data-control="student_upload"]': 'bulkUploadModal',
  },

  initialize: function() {
    this.model.bind('change', this.render, this);

    _.bindAll(this, 'togglePIIConfirm');
    _.bindAll(this, 'validatePIIConfirm');
    _.bindAll(this, 'onGetLinkClick');
    _.bindAll(this, 'onUploadClick');
    _.bindAll(this, 'setRegistrationLinkModalData');

    // Fetch the registration link to show on registrationLinkModal open.
    var classroomId = this.model.parentModel.id;
    var url = '/site-api/classrooms/generate_registration_link/' + classroomId + '/';
    var self = this;
    $.get(url, function(response) {
        self.registrationLinkData = response;
    })
    .fail(function(response) {
        console.error("error fetching registration link: " + JSON.stringify(response));
    });
  },
  clearErrors: function(e) {
    $(e.target).parents('.controls.error').removeClass('error');
  },
  setRegistrationLinkModalData: function(linkData) {
    $("#registration-link-modal input[name=reg_link]").val(linkData.reg_link).select();
    $('[data-control="info"].hovertext').css("visibility", "visible").css("display", "block");
    var expiryDate = new Date(linkData.expires_at);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    // e.g. May 29, 2025
    var formattedDate = expiryDate.toLocaleDateString('en-US', options);
    $(".registration-link-expiry").css("display", "block");
    $("#expiry-date b").text(formattedDate);
  },
  onGetLinkClick: function(e) {
      var classroomId = this.model.parentModel.id;
      var url = '/site-api/classrooms/generate_registration_link/' + classroomId + '/';
      var button = e.target;
      var acknowledged = this.validatePIIConfirm($('.pii-confirm-link')[0]);
      var self = this;
      // Only show the link if the box is checked.
      if (acknowledged) {
          $.post( url , function(response) {
              $(button).addClass("grey");
              self.setRegistrationLinkModalData(response);
              // Update `registrationLinkData` to persist the link on modal reopen
              self.registrationLinkData = response;
          })
          .fail(function(response) {
              console.error( "error generating registration link" + response );
          });
      }
      event.preventDefault();
  },
  render: function() {
    // select the template based on the number of students in the model
    if(this.model.models.length > 0){
      this.template = _.template($('#template-classroom-has-students-header').html())
      // show the sort button, since there is something to sort...
      $('.action-bar').show();
    }
    else {
      this.template = _.template($('#template-classroom-no-students-header').html())
    }
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },
  registerStudentModal: function(e){
    $('#login-dialog').modal('hide');
    e.preventDefault();

    $('#register-student-modal').append($('<div id="student-data"/>'));
    Scratch.EducatorStuff.student_modal = new Scratch.EducatorStuff.ClassroomStudentModalView({el: '#student-data'})
    $('#register-student-modal').modal('show');
    // default to having the current classroom selected
    var classroomId = this.model.parentModel.id;
    $('#register-student-modal').on('shown', function() {
      $("#register-student-modal select.classroom_id").val(classroomId);
    })
  },
  registrationLinkModal: function(e){
      e.preventDefault();
      var now = new Date();
      // Open modal dialog with underscore template 'template-ban-dialog'
      // Add event handlers for banning / cancelling
      $('#registration-link-modal').html(_.template($('#template-student-registration-link-dialog').html()));

      // If we have an unexpired token, prefill it in the modal
      if (this.registrationLinkData?.expires_at && new Date(this.registrationLinkData.expires_at) > now) {
        this.setRegistrationLinkModalData(this.registrationLinkData);
      }
      $('#registration-link-modal').modal('show');
      var self = this;
      $("#registration-link-modal button.btn-primary").click(self.onGetLinkClick);
      $('.piiConfirm').click(self.clearErrors);
      $('.pii-confirm-text').click(self.togglePIIConfirm);
  },
  togglePIIConfirm: function(e) {
      var piiConfirm = $(e.target).parent('.pii-confirm-text').siblings('.pii-notice').find('input')[0];
      if (piiConfirm) {
          piiConfirm.checked = !piiConfirm.checked;
      }
      this.clearErrors(e);
  },
  validatePIIConfirm: function(checkbox) {
      var piiConfirm = checkbox;
      var $piiConfirmError = $('[data-content="pii-confirm-error"] .text');

      if (!piiConfirm || !piiConfirm.checked) {
          $piiConfirmError.html('Please confirm that you understand');
          $('.piiConfirm').parents('.controls').addClass('error');
          return false;
      }
      return true;
 },
  bulkUploadModal: function(e){
      e.preventDefault();
      var view = this;
      var $modal = $('#student-upload-modal');
      $modal.html(_.template($('#template-student-upload-dialog').html()));
      $modal.modal('show');
      var $errors = $('.errors', $modal);
      $errors.empty().hide();
      $buttonContent = $('button.btn-primary', $modal).html();
      $loader = $('<span class="ajax-loader"></span>');
      var self = this;
      $('.pii-confirm-text').click(self.togglePIIConfirm);
      $('.pii-confirm-upload').click(self.clearErrors);
      $('button.btn-primary', $modal).click(self.onUploadClick);
  },
  onUploadClick: function(e) {
     var checkbox = $('.pii-confirm-upload')[0];
      var validated = this.validatePIIConfirm(checkbox);
      if (validated) {
          e.preventDefault();
          var view = this;
          var $modal = $('#student-upload-modal');
          var $errors = $('.errors', $modal);
          $buttonContent = $('button.btn-primary', $modal).html();
          $loader = $('<span class="ajax-loader"></span>');

        var $button = $(e.target);
        $errors.empty().hide();
        $.withCSRF(function (csrf) {
          $button.attr('disabled', true);
          $button.html($loader);
          var data = new FormData($('[name="csv-form"]', $modal)[0]);
          $.ajax({
            method: "post",
            url: '/classes/' + this.model.parentModel.id + '/student_upload/',
            data: data,
            processData: false,
            contentType: false,
            dataType: 'json'
          })
          .done(function (response) {
            $button.html($buttonContent);
            $button.attr('disabled', false);
            this.model.fetch({
              success: function (model, response, options) {
                $modal.modal('hide');
                this.render();
              }.bind(view)
            });
          }.bind(view))
          .fail(function (response) {
            $button.html($buttonContent);
            $button.attr('disabled', false);
            $.each(response.responseJSON, function (field, errors) {
              $errorList = $('<ul></ul>');
              $.each(errors, function (i, error) {
                $errorList.append('<li>' + error + '</li>');
              })
              $errors.append($errorList);
              $errors.show();
            });
          }.bind(view)); // fail
        }.bind(view)); // withCsrf
      }
  },
  close: function() {
    $(this.el).unbind();
    // don't remove the element since it is used for other classrooms
    //$(this.el).remove();
  },
});
