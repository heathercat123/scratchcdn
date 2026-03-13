$(function() {

    var adminView = new Scratch.AdminPanel({model: {}, el: $('#admin-panel')}); 

    var setBanFromTemplate = function () {
        // Changes the ban message, appeal status and length based on the
        // template chosen
        $('.admin-dialog-ban-textarea').val($('.admin-dialog-ban-template').val());
        $('.admin-dialog-ban-info-length').val(
            $('.admin-dialog-ban-template').find(':selected').data('ban-length') || ""
        );
        $('input[name="appeal-allowed"]').prop(
            'checked',
            ($('.admin-dialog-ban-template').find(':selected').data('appeal') === 1)
        );
    };

    var modifyTicket = function(ticketId, action) {
        // Used to change the status of tickets and update the UI.
        // `action` should be 'close', 'review', or 'open'
        var statuses = {'close': 2, 'review': 1, 'open': 0};
        var url = '/scratch_admin/tickets/'+ ticketId +'/';
        var options = {'status': statuses[action]};
        $.ajax(url, {
            type: 'POST',
            data: JSON.stringify(options),
            dataType: 'json',
            success: function(data) {
                // Change the ticket color
                var $tr = $('tr[data-ticket-id='+ ticketId +']');
                $tr.removeClass('just-closed just-reviewed just-opened');
                var actionClasses = {
                  'close': 'just-closed',
                  'open': 'just-opened',
                  'review': 'just-reviewed'
                };
                $tr.addClass(actionClasses[action]);

                // close any open more-info panes when ticket is closed
                var $nextRow = $tr.next();
                if ($nextRow.hasClass('more-info')) {
                    $nextRow.find('a.closerow-DUC').click();
                }
        }});
    };

    var moreInfoPane = function(title, content, $originTr, callback) {
        // a function to show more content about a particular ticket

        // remove all other open panes
        var $previousMoreInfo = $('.more-info');
        if ($previousMoreInfo.find('h2 span').text() === title) {
            // if it's already open, slide it back up
            return;
        }
        $previousMoreInfo.slideToggle(100).promise().done(function() {
            $(this).remove();
        });

        var $content = $("<tr class='more-info'><td colspan='3'><div class='content-wrapper'>"
                    + "<h2> [<a class='closerow-DUC'>X</a>] <span>"+ title +"</span></h2>"
                    + content + "</div></td></tr>");
        $content.find('a.closerow-DUC').on('click', function(evt) {
            // bind close button
            evt.preventDefault();
            var $moreInfoTr = $(evt.target).closest('tr');
            var $contentWrapper = $moreInfoTr.find('.content-wrapper');
            $contentWrapper.slideToggle(100).promise().done(function() {
                $moreInfoTr.remove();
            });
        });
        // insert into DOM and slide down so page content doesn't jump
        var $contentWrapper = $content.find('.content-wrapper');
        $contentWrapper.hide();
        $originTr.after($content);
        $contentWrapper.slideToggle(100).promise().done(function() {
            // when we're finally done adding new row, call option callback
            if (callback) {
                callback();
            }
        });
    };

    // bind close-all button behavior
    $('.clsbtn.close-all').on('click', function(evt) {
        // hack to just trigger click on all the 'close' buttons in this group
        var groupId = $(evt.target).attr('data-group-for');
        $('.clsbtn[data-group-id="'+ groupId +'"]').click();
    });

    // bindings for changing a ticket's status
    $('div.tab-pane button[data-control-ticketstatus]').click(function(e) {
        var ticketId = $(e.target).closest('tr').attr('data-ticket-id');
        var action = $(e.target).attr('data-control-ticketstatus');
        modifyTicket(ticketId, action);
    });
    
    // They're added as a quick way to pull in comments/IPs/mod actions
    // in collapsable table rows for the ticket queue.
    // For comments links:
    $('div.tab-pane a[data-user-comments]').click(function(e) {
        var $tr = $(e.target).closest('tr');
        var username = $(e.target).attr('data-user-comments');
        var $closerow = $('a.closerow-DUC');
        if ($closerow.length > 0)
            $closerow.click(); // Close the current pane
        var url = '/scratch_admin/comments/' + username + '/';
        $.ajax(url, {
            type: 'GET',
            success: function(data) {
                var title = username +"'s comments";
                moreInfoPane(title, data, $tr);
            }
        });
    });

    // For IP links:
    $('div.tab-pane a[data-user-ips]').click(function(e) {
        var $tr = $(e.target).closest('tr');
        var uid = $(e.target).attr('data-user-ips');
        var username = $(e.target).attr('data-username');
        var $closerow = $('a.closerow-DUC');
        if ($closerow.length > 0)
            $closerow.click(); // Close the current pane
        var url = '/scratch_admin/ips_by_user/' + uid + '/';
        $.ajax(url, {
            type: 'GET',
            success: function(data) {
                var title = username + "'s IP Addresses";
                moreInfoPane(title, data, $tr, function() {
                    var view = new Scratch.AdminProfile.view({el: $tr.next()})
                });
            }
        });
    });

    // For mod actions links:
    $('div.tab-pane a[data-user-modactions]').click(function(e) {
        var $tr = $(e.target).closest('tr');
        var uid = $(e.target).attr('data-user-modactions');
        var username = $(e.target).attr('data-username');
        var $closerow = $('a.closerow-DUC');
        if ($closerow.length > 0)
            $closerow.click(); // Close the current pane
        var url = '/scratch_admin/moderation_actions_by_user/' + uid + '/';
        $.ajax(url, {
            type: 'GET',
            success: function(data) {
                var title = username + "'s Moderation Actions";
                moreInfoPane(title, data, $tr, function() {
                    var view = new Scratch.AdminProfile.view({el: $tr.next()})
                })
            }
        });
    });

    // rolldown project thumbnails window
    $('div.tab-pane a[data-project-complaint-thumbnails]').click(function(e) {
        e.preventDefault();
        var $tr = $(e.target).closest('tr');
        var $closerow = $('a.closerow-DUC');
        if ($closerow.length > 0)
            $closerow.click(); // Close the current pane
        var moderationTicketId = $(e.target).attr('data-moderation-ticket-id');
        var url = '/scratch_admin/project_complaint_thumbnails/' + moderationTicketId + '/';
        $.ajax(url, {
            type: 'GET',
            success: function(data) {
                var title = "Project Complaint Thumbnails";
                moreInfoPane(title, data, $tr, function() {
                    var view = new Scratch.AdminProfile.view({el: $tr.next()})
                });
            }
        });
    });

    // rolldown project info panel
    $('.project-ticket-status[data-project-id]').click(function (e) {
        e.preventDefault();
        var $tr = $(e.target).closest('tr');
        var $closerow = $('a.closerow-DUC');
        if ($closerow.length > 0)
            $closerow.click(); // Close the current pane
        var projectId = $(this).attr('data-project-id');
        var url = '/scratch_admin/project_info/' + projectId + '/';
        $.ajax(url, {
            type: 'GET',
            success: function (data) {
                var title = "Project Info";
                moreInfoPane(title, data, $tr);
            }
        });
    });
   
    // button to send notification to user to stop reporting stuff that's fine
    $('a[data-control-action="notify-bad-reports"]').click(function(e) {
        e.preventDefault();
        var username = $(e.target).attr('data-username');
        var ticketId = $(e.target).closest('tr').attr('data-ticket-id');
        var notify_url = '/scratch_admin/notify/' + username + '/'; 
        var $template = $(_.template($('#template-notify-dialog').html(), {
            username: username,
            coms: []
        }));
        
        var type = $(e.target).attr('data-template-type');

        // get message text and type of message
        var args = {};
        if (type == "1") {
            args['message'] = '' +
                'Thanks for the report! We checked it out and couldn’t find ' +
                'anything wrong with the content you reported. Please only ' +
                'report projects, comments, profiles, or studios that are mean ' +
                'or inappropriate. Check out the <a href="/community_guidelines/">' +
                'Community Guidelines</a> (linked at the bottom of every page) for ' +
                'help deciding what is or isn\'t ok for Scratch.';
            args['type'] = 'Bad Reports 1';
        } else {
            args['message'] = '' +
                'We checked the project you reported, but didn\'t find any problems ' +
                'with it. Please only report projects or comments that are mean or ' +
                'inappropriate. Check out the <a href="/community_guidelines/">Community ' +
                'Guidelines</a> (linked at the bottom of every page) for help deciding ' +
                'what is or isn\'t ok for Scratch. Continuing to report stuff that ' +
                'doesn\'t break the <a href="/community_guidelines/">Community Guidelines' +
                '</a> may cause your account to be blocked. Thanks! - Scratch Team';
            args['type'] = 'Bad Reports 2';
        }

        $.post(notify_url, JSON.stringify(args), function() {
            // mark the ticket as closed when a notification is sent
            modifyTicket(ticketId, 'close');
        });
    });

    // For sanity, these have mostly been lifted from js/views/admin-panel.js
    // and modified to not depend on the particular user model.
    $('button[data-control-action="notify"]').click(function(e) {
        //clear out ajax-loaded data if it exists already
        if ($('#admin-dialog-comments-list').length) {
            $('#admin-dialog-comments-list').empty();
        }
        if ($('#admin-dialog-notifications').length) {
            $('#admin-dialog-notifications').empty();
        }

        var username = $(e.target).attr('data-username');
        var userId = $(e.target).closest('tr').children('td').children('div.userdetails').find('a[data-user-modactions]').data('user-modactions');
        var ticketId = $(e.target).closest('tr').attr('data-ticket-id');
        var notify_url = '/scratch_admin/notify/' + username + '/';        
        
        //comments in view do not match the user, so close them and get user's comments.
        var $tr = $(e.target).closest('tr');
        var $closerow = $('a.closerow-DUC');
        if ($closerow.length > 0)
            $closerow.click(); // Close the current pane
        var url = '/scratch_admin/comments/' + username + '/';
        var currPage = 1;
        var currFilter = null;
        var hasMore = 1; 
        var comments = [];
        $.ajax(url, {
            type: 'GET',
            success: function(data) {
                var title = username +"'s comments";
                moreInfoPane(title, data, $tr);
                comments = $(data).find("ul.comments").children("li");
            }
        }).then(function() {
            $('#admin-dialog').html(_.template($('#template-notify-dialog').html(), {
                username: username,
                coms: commentsToObj(comments)
            }));
            $('#admin-dialog').width('auto');
            $('#admin-dialog').modal('show');
            
            // initialize the text to the first template in the select
            $('#admin-dialog-message textarea').val($('#admin-dialog-message select').val());
            $('#admin-dialog-message select').change(function(e){
                $('#admin-dialog-message textarea').val($('#admin-dialog-message select').val());
            });
            $('#admin-dialog-message textarea').on('change', function(evt) {
                // when they change the template text, mark it as custom
                $('#admin-dialog-message select').val(null);
            });

            //Set events for comment checkboxes, get modactions
            notificationCheckboxes();
            getModActions(userId);

            //Set filters for comments view
            $("#admin-dialog-comments select").change(function (e) {
                $("#admin-dialog-comments-list li").remove();
                currPage = 0;
                hasMore = 1;
                loadComments(); // Picks up new selected filter
            });

            $('#admin-dialog button.btn-primary').click(function(){
                var args = {message: $('#admin-dialog-message textarea').val(), type: $('#admin-dialog-message option:selected').text()};
                $.ajax(notify_url, {
                    type: 'POST',
                    data: JSON.stringify(args),
                    dataType: 'json',
                    success: function() {
                        // mark the ticket as closed when a notification is sent
                        modifyTicket(ticketId, 'close');
                    },
                    error: function (xhr, status, error) {
                        Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: 'Could not notify, please try again (error: ' + error + ')'});
                    }
                });
                $('#admin-dialog').modal('hide');
            });
            
            function loadComments() {
                var deletedFilter = null;
                switch ($("#admin-dialog-comments select").val()) {
                    case 'Marked by Filter':
                        deletedFilter = 2;
                        break;
                    case 'Deleted':
                        deletedFilter = 1;
                        break;
                }
                var filterParam = deletedFilter ? ('&deleted=' + deletedFilter) : '';
                url = '/scratch_admin/comments/' + username + '/?page=' + currPage + filterParam;
                $.ajax(url, {
                    type: 'GET',
                    success: function (data) {
                        if ($(data).find('li').length > 0) {
                            currPage++;
                            comments = commentsToObj($(data).find('li'));
                            for (var i = 0; i < comments.length; i++) {
                                $('#admin-dialog-comments-list').append(
                                    _.template($('#admin-dialog-comments-list-element').html(), {
                                        comment: comments[i]
                                    })
                                );
                            }
                        } else {
                            hasMore = 0;
                        }
                    },
                    error: function () {
                        hasMore = 0;
                    }
                });
            }
            //add infinite scroll  
            $("#admin-dialog-comments .comments-list").scroll(function() {
                if (!hasMore) return;
                if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    loadComments();
                }
            });
        });
    });
    
    $('button[data-control-action="ban"]').click(function(e) {
        var username = $(e.target).attr('data-username');
        var userId = $(e.target).closest('tr').children('td').children('div.userdetails').find('a[data-user-modactions]').data('user-modactions');
        var ban_url = '/scratch_admin/ban/' + username + '/'; 
        // Open modal dialog with underscore template 'template-ban-dialog'
        // Add event handlers for banning / cancelling                    
        $('#admin-dialog').html(_.template($('#template-ban-dialog').html(),
            {'username': username}
        ));
        $('#admin-dialog').modal('show'); 

        // initialize the text to the first template in the select
        // or a default message, if provided (i.e. respawns)
        var defaultBanMessage = $(e.target).attr('data-default-message');
        if (defaultBanMessage) {
            $('.admin-dialog-ban-template').val(defaultBanMessage);
        }
        setBanFromTemplate();
        
        $('.admin-dialog-ban-template').change(function(e){
            // set the ban text, ban length and ban appeal settings based on change
            setBanFromTemplate();
        });
        $('.admin-dialog-ban-textarea').on('change', function(evt) {
            // when they change the template text, mark it as custom
            $('.admin-dialog-ban-template').val(null);
        });

        //get modactions
        getModActions(userId);
                                  
        $('#admin-dialog button.btn-primary').click(function(){           
            var banLength = $('.admin-dialog-ban-info-length').val() || null;               
            var message = $('.admin-dialog-ban-textarea').val();
            var args = {                                                  
                ban_status: 'banned',                              
                ban_length: banLength,
                appeal_allowed: $('input[name="appeal-allowed"]:checked').length > 0,                            
                ban_message: message,
                type: $('.admin-dialog-template-dropdown option:selected').text()
            };                                                            
            $.ajax(ban_url, {
                type: 'POST',
                data: JSON.stringify(args),
                dataType: 'json',
                success: function() {
                    modifyTicket(ticketId, 'close');
                },
                error: function (xhr, status, error) {
                    Scratch.AlertView.msg($('#alert-view'), {alert: 'error', msg: 'Could not ban, please try again (error: ' + error + ')'});
                }
            });                                                            
            $('#admin-dialog').modal('hide');                             
        });
    });

    var querystringToObj = function(querystring) {
        if (querystring.length == 0) {
            return {};
        }

        querystring = querystring.indexOf("?") == 0 ? querystring.substring(1, querystring.length) : querystring;
        var dict = {};
        var parameters = querystring.split("&")
        parameters.forEach(function(element, index, array) {
            var param_tup = element.split("=");
            dict[param_tup[0]] = param_tup[1];
        });
        return dict;
    };

    var objToQuerystring = function(dict) {
        var querystring = "";
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                querystring += "&" + key + "=" + dict[key];
            }
        }
        if (querystring.length > 0) {
            querystring = "?" + querystring;
            querystring = querystring.replace("?&", "?");
        }
        return querystring;
    };

    var openFilterDropdown = function($element) {
        $element.removeClass('button');
        $element.text('Remove Filters');
    };

    var reloadPageWithoutFilters = function() {
        window.location.search = objToQuerystring({});
        return false;
    };

    $('#filter-toggle-button').click(function(e) {
        var remove_filters = !($(this).hasClass('button'));
        if (remove_filters) {
            reloadPageWithoutFilters();
        } else {
            openFilterDropdown($(this));
        }
    });

    $('input[data-checkbox-type=filter-list-checkbox]').change(function() {
        if (this.checked) {
            $(this)
                .siblings('.child-filter-list')
                .find('input[data-checkbox-type=filter-list-child-checkbox]')
                .prop('checked', true);
        } else {
            $(this)
                .siblings('.child-filter-list')
                .find('input[data-checkbox-type=filter-list-child-checkbox]')
                .prop('checked', false);
        }
    });

    $('input[data-checkbox-type=filter-list-child-checkbox]').change(function() {
        if (this.checked) {
            if ($(this).parent().siblings().children('input:checked').length == $(this).parent().siblings().length) {
                $(this)
                    .parents('.child-filter-list')
                    .siblings('input[data-checkbox-type=filter-list-checkbox]')
                    .prop('checked', true);
            }
        } else {
            $(this).parents('.child-filter-list')
                   .siblings('input[data-checkbox-type=filter-list-checkbox]')
                   .prop('checked', false);
        }
    });

    function getParameterByName(name) {
        // From http://stackoverflow.com/a/901144
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    $(function() {
        if ($('input[data-checkbox-type=filter-list-checkbox]:checked').length > 0 ||
            $('input[data-checkbox-type=filter-list-child-checkbox]:checked').length > 0) {
            $('.collapse').collapse('toggle');
            openFilterDropdown($('#filter-toggle-button'));
        }
    });
});
