/* View to display a single AdminAction item in a EducatorStuff alert list
 */

Scratch.EducatorStuff.ClassroomAlertThumbnailView = Backbone.View.extend({
  tagName: 'li',

  events: {
    'click [data-control="hide-alert"]': 'hideAlert',
  },

  initialize: function() {
    this.template = _.template($('#template-alert-list-item').html());
    // allowHideAlerts controls whether or not the alert message is dimissible
    this.allowHideAlerts = this.options.allowHideAlerts || false;
  },
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;

  },
  hideAlert: function(e){
     var alertId = $(e.target).parents('.alert-item-content').data('alert-id');
     var self = this;
     $.ajax({
       type: 'POST',
       url: '/site-api/classrooms/alerts/hide/',
       data: JSON.stringify({alertId: alertId}),
       dataType: 'json',
     })
     .done(function() {self.removeSuccess(e)})
     .fail(function() {self.removeFail(e)});
  },
  removeSuccess: function(e) {
    var $parentList = $(e.target).parents('ul:first');
    var cnt = $parentList.children().length;
    if ($parentList.children().length ==1 ) {
      $parentList.parents().closest('.wrapper').slideUp('slow');
      $parentList.fadeOut('slow');
    }
    $(e.target).parents('li').fadeOut().remove();
    Scratch.EducatorStuff.EventMgr.trigger('alert-dismissed');
  },

  removeFail: function() {
  },
  close: function() {
    $(this.el).unbind();
    $(this.el).remove();
  },

});


Scratch.EducatorStuff.ClassroomAlertThumbnailCollectionView = Backbone.View.extend({
  className: 'media-list',
  tagName: 'ul',
  events: {
  },
  initialize: function() {
    this.el = this.options.el || this.el;
    this.className = this.options.className || this.className;
    // allowHideAlerts controls whether or not the alert message is dimissible
    this.allowHideAlerts = this.options.allowHideAlerts || false;
    this.model.bind('reset', this.render, this);
    this.model.bind('add', this.render, this);
  },
  render: function() {
    $(this.el).html('');
    _.each(this.model.models, function(classroom) {
        $(this.el).append(new Scratch.EducatorStuff.ClassroomAlertThumbnailView({ model: classroom, allowHideAlerts: this.allowHideAlerts}).render().el);
    }, this);
    return this;
  },
  close: function() {
    $(this.el).unbind();
    //$(this.el).remove();
  },
});
