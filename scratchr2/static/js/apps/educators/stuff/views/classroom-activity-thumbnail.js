/* View to display a single SocialAction item in a EducatorStuff activity list
 */

Scratch.EducatorStuff.ClassroomActivityThumbnailView = Backbone.View.extend({
  //template: _.template($('#template-activity-list-item').html()),

  // TODO: create templates for all the success / error messages in AlertView
  tagName: 'li',

  events: {
    // 'click [data-control="add-to"]': 'addToGallery',
  },

  initialize: function() {
    this.template = _.template($('#template-activity-list-item').html());
    // this.model.bind('change', this.render, this);
  },
  render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
    return this;

  },
  close: function() {
    $(this.el).unbind();
    $(this.el).remove();
  },

});


Scratch.EducatorStuff.ClassroomActivityThumbnailCollectionView = Backbone.View.extend({
  className: 'media-list',
  tagName: 'ul',
  events: {
  },
  initialize: function() {
    this.model.bind('reset', this.render, this);
    this.model.bind('add', this.render, this);
  },
  render: function() {
    $(this.el).html('');
    _.each(this.model.models, function(classroom) {
        $(this.el).append(new Scratch.EducatorStuff.ClassroomActivityThumbnailView({ model: classroom}).render().el);
    }, this);

    return this;
  },



});
