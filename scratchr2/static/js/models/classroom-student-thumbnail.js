/* Manage data for a classroom gallery (studio) thumbnail (shared or unshared)  */

Scratch.ClassroomStudentThumbnail = Scratch.Model.extend({
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
  urlRoot: '/site-api/users/all/',
  slug: 'username',
});


/**************************************************
* COLLECTIONS
* Manage a collection of project thumbnails
* intialize with @collectionType and @params{}
*/
Scratch.ClassroomStudentsThumbnailCollection = Scratch.Collection.extend({
  model: Scratch.ClassroomStudentThumbnail,
  urlRoot: '/site-api/classrooms/',

  initialize: function(models, options) {
    // _meta contains 'filter, sort, collectionType, urlParams
    this._meta = options;
    this.options = options;
    this.parentModel = this.options.parentModel;
  },
  meta: function(prop, value) {
    if (value === undefined) {
      return this._meta[prop]
    } else {
      this._meta[prop] = value;
    }
  },

});


