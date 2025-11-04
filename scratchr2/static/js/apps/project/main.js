var Scratch = Scratch || {};
Scratch.Project = Scratch.Project || {};

var isCreatePage = document.location.pathname == '/projects/editor/';
Scratch.Project.Router = Backbone.Router.extend({
  
  routes: {
      ""       :  (isCreatePage ? "editor" : "player"),
      "editor" :  "editor",
      "player" :  "player",
      "fullscreen" :  "fullscreen",
      "comments*comment_id": "player"
  },

  initialize: function() {

    if (!swfobject.hasFlashPlayerVersion("1")) {
      // flash disabled - show the project page
      $('body').removeClass('black white');
    }

    this.projectModel = new Scratch.ProjectThumbnail(Scratch.INIT_DATA.PROJECT.model, {
      related: {
        lovers: new Scratch.UserThumbnailCollection([], {model: Scratch.UserThumbnail, collectionType: 'lovers'}),
        favoriters: new Scratch.UserThumbnailCollection([], {model: Scratch.UserThumbnail, collectionType: 'favoriters'}), 
        tags: new Scratch.TagCollection([], {model: Scratch.Tag, collectionType: 'project'}), 
        comments: new Scratch.CommentCollection([], {model: Scratch.Comment, collectionType: 'project'})
      }
    });
    
    if ($.inArray('edit-project', Scratch.LoggedInUser.permissions)) {  // AL NOTE: $.inArray works like indexOf() - this if check may be testing for the wrong thing
      if(!this.projectView) {
        this.projectView = new Scratch.Project.EditView({model: this.projectModel, el: $('#project')});
      }
    }
    

    var self = this;
    $.when(window.SWFready) 
    .done(function(){
      Scratch.FlashApp = new Scratch.FlashAppView({model: self.projectModel, el: $('#scratch'), loggedInUser: Scratch.LoggedInUser, editor: true, is_new: Scratch.INIT_DATA.PROJECT.is_new});
    });

    if (Scratch.INIT_DATA.ADMIN) {
      this.adminView = new Scratch.AdminPanel({model: this.projectModel, el: $('#admin-panel')}); 
    }
  },

  player: function(comment_id) {
    // comment_id is optional
    if(Scratch.FlashApp) {
        var msg = Scratch.FlashApp.beforeUnload();
        if(msg && !confirm(msg + '\n' + gettext('Would you like to leave the editor anyway?')))
            window.location.hash = 'editor';
    }

    $.when(window.SWFready) 
     .done(function(){
        Scratch.FlashApp.setEditMode(false);
    });
    var self = this;
    if (Scratch.INIT_DATA.PROJECT.model.isPublished || Scratch.INIT_DATA.ADMIN) {
       
      //$('#comments').children().andSelf().unbind().die(); // unbind any previous event handlers on the element
      if(!this.commentView){
        this.commentView = new Scratch.Comments({el: $('#comments'), scrollTo: comment_id, type: 'project', typeId: Scratch.INIT_DATA.PROJECT.model.id});
      }
    }
  },

  editor: function() {
    $.when(window.SWFready) 
    .done(function(){
      Scratch.FlashApp.setEditMode(true);
    });
  },
 
  fullscreen: function() {
    $('body').removeClass('editor').addClass('editor');
    $.when(window.SWFready)
    .done(function(){
      Scratch.FlashApp.ASobj.ASsetPresentationMode(true);
    });
  }

});

// wrap in both document.ready and SWFready to ensure that none of the swf functons
// (e.g. asObj.setEditMode()) get called until the SWF is ready, and that the SWF doesn't call
// any of the JS functions (JSsetEditMode()) until all the js files have been loaded and parsed.
$(function() {
  app = new Scratch.Project.Router();
  Backbone.history.start();
});

