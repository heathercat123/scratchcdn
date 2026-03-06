/* Manage data for a AdminAction (Alert) thumbnail */

Scratch.ClassroomAlertThumbnail = Scratch.Model.extend({
  /* data:
   * id
   * title
   * shared (bool)
   * trashed (bool)
   * stats: loves, favorites, galleries, views, remixes, comments (int)
   * dates: last-modified, created (dates)
   * thumbnail
   * selected
   */
  // TODO: Remove the 'all' portion of the URL
  urlRoot: '/site-api/messages/all/',

  initialize: function(){
    // SocialAlert.extra_data comes in as a JSON string. It needs
    // to be parsed so that the _ template can access its values
    if (this.attributes.admin_action && this.attributes.admin_action.extra_data) {
        try {
            this.attributes.admin_action.extra_data = $.parseJSON(this.attributes.admin_action.extra_data);
        } catch (err) {
            this.attributes.admin_action.extra_data = '';
        }
    }
  }
});


/**************************************************
* COLLECTIONS
* Manage a collection of AdminAction (Alert) thumbnails
* intialize with @collectionType and @params{}
*/
Scratch.ClassroomAlertThumbnailCollection = Scratch.Collection.extend({
  model: Scratch.ClassroomAlertThumbnail,
  urlRoot: '/site-api/classrooms/',

  initialize: function(models, options) {
    // _meta contains 'filter, sort, collectionType, urlParams
    this._meta = options;
    this.options = options;
    this.parentModel = this.options.parentModel;
  },
  /**
   * Overrides the Scratch.Collection url function in order to handle filtering
   * by classroom.
   */
  url: function() {
    var url = this.urlRoot;
    url += (this.options['collectionType'])? this.options['collectionType']+ '/' : '';
    url += (this.options['filter'])? this.options['filter'] + '/': ''
    return url;
  },
  meta: function(prop, value) {
    if (value === undefined) {
      return this._meta[prop]
    } else {
      this._meta[prop] = value;
    }
  }
});
