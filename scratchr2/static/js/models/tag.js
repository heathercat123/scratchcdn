Scratch.Tag = Scratch.Model.extend({
  urlRoot: '/site-api/tags/all/',
  slug: 'name', 
});

Scratch.TagCollection = Scratch.Collection.extend({
  model: Scratch.Tag,
  urlRoot: '/site-api/tags/',
  slug: 'name', 
  
  initialize: function(models, options) {
    this.options = options;
  }  
 /* 
  addTag: function(tag, options) {
    options = options || {};
    options.url = '/site-api/tags/project/' + this.parentModel.get('pk') + '/add/?' + 'names=' + tag;
    this.sync('update', this, options);
  },
  
  removeTag: function(tag, options) {
    options = options || {};
    options.url = '/site-api/tags/project/' + this.parentModel.get('pk') + '/remove/?' + 'names=' + tag;
    this.sync('update', this, options);
  },
 */
  /* get or set collection data from server */
  /* 
  sync: function(method, model, options) {
    console.log('SYNC IS CALLED!');
    if (!options.url) {
      options.url = this.url() + this.url_params();
    }
    Backbone.sync(method, model, options);
  },
  */
});


