var Scratch = Scratch || {};
Scratch.AdminProfile = Scratch.AdminProfile || {};

Scratch.AdminProfile.Router = Backbone.Router.extend({

  initialize: function() {
      this.adminView = new Scratch.AdminPanel({model: this.projectModel, el: $('#admin-panel')}); 
  },
});

$(function() {
    Scratch.LoggedInUser = new Scratch.LoggedInUserModel(Scratch.INIT_DATA.LOGGED_IN_USER.model, Scratch.INIT_DATA.LOGGED_IN_USER.options);
    app = new Scratch.AdminProfile.Router();

    // load the moderator actions async
    function load_moderation_actions_by_user(){
        $.ajax('/scratch_admin/moderation_actions_by_user/'+Scratch.INIT_DATA.PROFILE.model.userId+'/', {
            type: 'GET',
            success: function(data) {
                $('#notifications').html(data);
                $("a[data-actionid]").click(function(e){
                    e.preventDefault();
                    var t = _.template($('#template-confirm-delete-admin-action').html())
                    var actionid = $(this).data('actionid');
                    $(t()).dialog({
                        title: "Delete Moderation Action?",
                        buttons: {
                            "Yes": function(){
                                var dialog = $(this);
                                $.post(
                                    "/scratch_admin/moderation_action/"+actionid+"/delete/",
                                    {pk: actionid},
                                    function(data, status, xhr){
                                        dialog.dialog("close");
                                        if(data.success){
                                            load_moderation_actions_by_user();
                                        }else{
                                            $("<p>"+data.msg+"</p>").dialog({
                                                title: "Something went wrong"
                                            });
                                        }
                                    }
                                );
                            },
                            "No": function(){$(this).dialog("close");}
                        }
                    });
                })
            }
        });
    }
    load_moderation_actions_by_user();

    // Load the ip list
    $.ajax('/scratch_admin/ips_by_user/'+Scratch.INIT_DATA.PROFILE.model.userId+'/', {
        type: 'GET',
        success: function(data) {
            // Replace the inner html with the IP information UI and bind evts
            var $ipsUsed = $('#ips-used');
            $ipsUsed.html(data);
            var view = new Scratch.AdminProfile.view({el: $ipsUsed})
        }});

    // Load the user content counts
    $.ajax('/scratch_admin/user_content_by_user/' + Scratch.INIT_DATA.PROFILE.model.userId + '/', {
      type: 'GET',
      success: function(data) {
        var $contentOverview = $('#user-content-overview');
        $contentOverview.html(data);
      }
    });

    $('A.make_featured_curator').click(function(evt) {
      if (!confirm(`Do you really want to make ${Scratch.INIT_DATA.PROFILE.model.username} the featured curator?`)) return;
	    $.ajax('/scratch_admin/set_featured_curator/'+Scratch.INIT_DATA.PROFILE.model.userId+'/', {
	        type: 'POST',
	        success: function(data) {
	            alert('This user is now the featured curator.');
              document.location.reload();
	        }
	    });
    });
});
