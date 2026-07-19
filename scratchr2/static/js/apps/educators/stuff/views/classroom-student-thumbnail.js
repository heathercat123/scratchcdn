/* View to display a single student item in a EducatorStuff students list
 */

Scratch.EducatorStuff.ClassroomStudentThumbnailView = Backbone.View.extend({
  template: _.template($('#template-student-list-item').html()),

  tagName: 'li',

  events: {
    'click [data-control-action="student-settings"]' : 'studentSettings',
    'click [data-control-action="change-password"]' : 'changeStudentPassword',
  },

  initialize: function() {
    // this.template = this.options.template || this.template;
    this.model.bind('change', this.render, this);
   },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },

  studentSettings: function(e){
      e.preventDefault();
      // Open modal dialog with underscore template 'template-student-settings-dialog'
      var studentSettings = new Scratch.EducatorStuff.StudentSettingsView({
        el: $("#student-settings"),
        model: this.model
      });
      studentSettings.render();
      studentSettings.$el.modal('show');
  },

  changeStudentPassword: function(e){
      e.preventDefault();
      var username = this.model.attributes.user.username;
      var change_password_url = '/site-api/classrooms/change_student_password/' + username + '/';
      var model = this.model;
      // Open modal dialog with underscore template 'template-ban-dialog'
      // Add event handlers for banning / cancelling
      $('#admin-dialog').html(_.template($('#template-change-password-dialog').html(),
          {'username': username}
      ));
      $('#admin-dialog').modal('show');
      $('#admin-dialog button.btn-primary').click(function(){
          var new_password1 = $('#admin-dialog :input[name="new_password1"]').val() || null;
          var new_password2 = $('#admin-dialog :input[name="new_password2"]').val() || null;
          var args = {
              'new_password1': new_password1,
              'new_password2': new_password2,
          };
          $.ajax(change_password_url, {type: 'POST', data: JSON.stringify(args), dataType: 'json', success: function() {
            Scratch.EducatorStuff.EventMgr.trigger('success-message', "Student password successfully changed.");
          }});
          $('#admin-dialog').modal('hide');
      });
  },
  close: function() {
    $(this.el).unbind();
    $(this.el).remove();
  },

});


Scratch.EducatorStuff.ClassroomStudentThumbnailCollectionView = Backbone.View.extend({
  className: 'media-list',
  tagName: 'ul',

  initialize: function() {
    this.model.bind('reset', this.render, this);
    this.model.bind('add', this.render, this);
  },

  render: function() {
    $(this.el).html('');
    _.each(this.model.models, function(classroom) {
        $(this.el).append(new Scratch.EducatorStuff.ClassroomStudentThumbnailView({ model: classroom }).render().el);
    }, this);

    return this;
  },



});

Scratch.EducatorStuff.StudentSettingsView = Backbone.View.extend({
  template: "#template-student-settings-dialog",

  initialize: function() {
    this.model.bind('change', this.render, this);
  },

  render: function() {
    this.$el.html(_.template($(this.template).html(), this.model.toJSON()));
    $(".tooltip span.hovertext").css("visibility", "visible");
    $('#prompt-student-button', this.$el).click(function (event) {
      event.preventDefault();
      $.ajax({
        type: 'POST',
        url: '/site-api/classrooms/reset_student_password/' + this.model.attributes.user.username + '/',
        dataType: 'json',
        success: function(response) {
          $('#prompt-student-button').prop('disabled', true);
          $('#prompt-student-button').val('Prompted');
        }.bind(this),
        error: function(response) {
          Scratch.EducatorStuff.EventMgr.trigger('error-message', Scratch.ALERT_MSGS['error']);
        }.bind(this)
      })
    }.bind(this));
    $('[data-action="remove-icon"]', this.$el).click(function(e){
      e.preventDefault();
      var url = '/site-api/classrooms/moderate/profile/' + this.model.get("user").username + '/thumbnail/';
      $.post(url, {}, function(response, success, jqXHR){
          if (jqXHR.status == 200) {
            user = this.model.get("user")
            user.thumbnail_url = response.thumbnail_url;
            this.model.set({user: user, thumbnail_url: response.thumbnail_url});
          }
        }.bind(this), 'json');
    }.bind(this));
  }
})
