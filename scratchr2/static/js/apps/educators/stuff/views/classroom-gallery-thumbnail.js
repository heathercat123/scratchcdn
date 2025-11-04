/* View to display a single gallery (studio) item in a EducatorStuff galleries list
 */

Scratch.EducatorStuff.ClassroomGalleryThumbnailView = Backbone.View.extend({
  template: _.template($('#template-gallery-list-item').html()),

  tagName: 'li',

  events: {
    'click [data-control="trash"]' : 'trash',
  },

  initialize: function() {
    // this.template = this.options.template || this.template;
    // this.model.bind('change', this.render, this);

    // bind all success & error functions in order to ensure correct context
    _.bindAll(this, "trashed");
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;

  },
  trash: function(e) {
    if (confirm(Scratch.ALERT_MSGS['studio-confirm-delete'])){
      this.model.save({visibility: 'delbyusr'}, {
        success: this.trashed,
        error: this.error
      });
    }
    e.preventDefault();
  },
  trashed: function(model, resp, options) {
    $(this.el).fadeOut();
    Scratch.EducatorStuff.EventMgr.trigger('success-message', Scratch.ALERT_MSGS['studio-deleted']);
    Scratch.EducatorStuff.EventMgr.trigger('gallery-trashed');
  },
  close: function() {
    $(this.el).unbind();
    $(this.el).remove();
  },

});


Scratch.EducatorStuff.ClassroomGalleryThumbnailCollectionView = Backbone.View.extend({
  className: 'media-list',
  tagName: 'ul',

  initialize: function() {
    this.model.bind('reset', this.render, this);
    this.model.bind('add', this.render, this);
  },

  render: function() {
    $(this.el).html('');
    _.each(this.model.models, function(classroom) {
        $(this.el).append(new Scratch.EducatorStuff.ClassroomGalleryThumbnailView({ model: classroom}).render().el);
    }, this);

    return this;
  },



});
