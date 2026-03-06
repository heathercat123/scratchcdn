Scratch.EducatorStuff.ClassroomsHeaderView = Backbone.View.extend({
  template: _.template($('#template-classrooms-header').html()),
  el: '#header-content',

  events: {
    'click [data-control="add_class"]': 'addClassModal',
  },

  initialize: function() {
    this.template = this.options.template || this.template;
    this.el = this.options.el || this.el;
  },

  render: function() {
    $(this.el).html(this.template());
    return this;
  },

  close: function() {
    $(this.el).unbind();
    $(this.el).remove();
  },

  addClassModal: function(e){
    e.preventDefault();
    $('#login-dialog').modal('hide');
    var classData = $('<div/>');
    $('#add-class-modal').html(classData);
    new Scratch.EducatorStuff.ClassroomAddModalView({el: classData})
    $('#add-class-modal').modal('show');
  },

});
