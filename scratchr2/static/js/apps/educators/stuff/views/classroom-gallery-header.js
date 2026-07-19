Scratch.EducatorStuff.ClassroomGalleryHeaderView = Backbone.View.extend({

  events: {
    'click [data-control="add_classroom_gallery"]': 'addGalleryModal',
  },

  initialize: function() {
    this.model.bind('change', this.render, this);
  },

  render: function() {
    // select the template based on the number of students in the model
    if(this.model.models.length > 0){
      this.template = _.template($('#template-classroom-has-studios-header').html())
      // show the sort button, since there is something to sort...
      $('.action-bar').show();
    }
    else {
      this.template = _.template($('#template-classroom-no-studios-header').html())
    }
    // / var template = _.template($('#template-sidebar-classroom-list-item').html());
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },
  addGalleryModal: function(e){
    $('#login-dialog').modal('hide');
    e.preventDefault();

    $('#add-gallery-modal').append($('<div id="gallery-data"/>'));
    Scratch.EducatorStuff.gallery_modal = new Scratch.EducatorStuff.ClassroomGalleryModalView({el: '#gallery-data'})
    // default to having the current classroom selected
    const classroomId = this.model.parentModel.id;
    const classroomTitle = this.model.parentModel.get('title');
    $('#add-gallery-modal').on('shown', function() {
      $("#add-gallery-modal select.classroom_id").val(classroomId);
      $("#add-gallery-modal .classroom_title").html(classroomTitle);
      $("#add-gallery-modal input[type=submit]").val('Add Class Studio');
      $("#add-gallery-modal input[type=submit]").removeClass('grey');
      $("#add-gallery-modal input[type=submit]").removeClass('disabled');
      $("#add-gallery-modal .add_gallery_modal_ready_for_submit").val('true');
    });
    $('#add-gallery-modal').modal('show'); // show AFTER we define what to do when it shows
  },
  close: function() {
    $(this.el).unbind();
    // don't remove the element since it is used for other classrooms
    //$(this.el).remove();
  },
});
