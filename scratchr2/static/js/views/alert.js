/* Represents the alert messages for a page 
 * Success, Error, Undo
 */
Scratch.Alert = Backbone.Model.extend({
  /* ATTRIBUTES
   * message, type
   */

}); 


/* View to handle alerts including:
 * (errors, successful updates, warnings)
 */

Scratch.AlertView = Backbone.View.extend({
  template: _.template('<div></div>'),
  
  events: {
    'click .undo'   : 'undo',
    'click [data-control="close"]' : 'close',
  },

  initialize: function() { 
    this.model = new Scratch.Alert();
    this.model.bind('change', this.render, this)
    _.bindAll(this, 'success'); 
    _.bindAll(this, 'error'); 
    _.bindAll(this, 'toggleFloat'); 
    this.options.eventMgr.bind('success', this.success);
    this.options.eventMgr.bind('error', this.error);
    $(window).bind('scroll', this.toggleFloat);
  },
  
  // display the alert message
  render: function() {
    this.$('[data-control="message"]').html(this.template(this.model.toJSON()));

    if (this.model.get('type') == 'error') {
      $(this.el).show(); 
    } else if (this.model.get('type') == 'success') {
      $(this.el).show().delay(4000).fadeOut('slow');
    }
    this.model.clear({silent: true});
    return this;
  },

  success: function(message) {
    this.template = _.template($('#template-alert-' + message).html());
    this.model.set({message: message, type: 'success'});
  },

  error: function(message) {
    this.model.set({message: message, type: 'error'});
  },
  
  toggleFloat: function() {
    if (!this.topPosition) {
      /* 33 affords space for the site top nav TODO: make this a variable */
      /* requires show then hide to calculate position since hidden views hove 0 offset */
      this.topPosition = $(this.el).show().offset().top- 33;
      $(this.el).hide();
    }
    var windowScrollPosition = $(window).scrollTop();
    if (windowScrollPosition >= this.topPosition) {
      $(this.el).toggleClass('floating', true);
    } else {
      $(this.el).toggleClass('floating', false);
    } 
  },
  close: function() {
    $(this.el).hide();
  }, 
  
  undo: function() {
    this.options.eventMgr.trigger('undo');
  },
});

