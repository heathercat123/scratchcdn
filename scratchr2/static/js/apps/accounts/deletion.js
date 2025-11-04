var Scratch = Scratch||{};
Scratch.Accounts = Scratch.Accounts||{};

Scratch.Accounts.ConfirmDeletionPopUpView = Backbone.View.extend({
    template: _.template($('#template-deletion-form').html()),
    events: {
        'click #next-step': 'getDeletionPopUp',
    },

    getDeletionPopUp: function(e) {
        e.preventDefault();
        var template = $(this.template());
        $(template).dialog({
            title: gettext("Delete my account"),
            create: function(e, ui) {
                var deletion_form = new Scratch.Accounts.ConfirmDeletionFormView({
                    el: $(this),
                });
            },
        });
    },
});

Scratch.Accounts.ConfirmDeletionFormView = Backbone.View.extend({
    events: {
        'submit form': 'submitDeletionRequest',
        'input input[type="password"]': 'handlePasswordChange',
    },

    submitDeletionRequest: function(e) {
        e.preventDefault();
        
        var self = this;
        raw_form = this.$('form').serializeArray();
        data_obj = {};
        for (var i=0; i<raw_form.length; i++){
            data_obj[raw_form[i]['name']] = raw_form[i]['value'];
        }

        $.ajax({
            url: '/accounts/settings/delete_account/',
            type: 'POST',
            data: data_obj,
        }).done(function(data) {
            if (data['success']) {
                self.handleValidForm(data);
            } else {
                self.handleInvalidForm(data);
            }
        });
        return false;
    },

    handleInvalidForm: function(data) {
        var self = this;
        var error_str = "";
        $.each(data['errors'], function(key, value) {
            error_str += ("<li>* " + value + "</li>");
        });
        self.$('.errors').html(error_str);
    },

    handleValidForm: function(data) {
        window.location = data['url'];
    },

    handlePasswordChange: function(e) {
        if (e.target.value.length == 0) {
            this.$('input[type="submit"]').prop('disabled', true);
        } else {
            this.$('input[type="submit"]').prop('disabled', false);
        }
    },
});

$(function(){
    var deletion_view = new Scratch.Accounts.ConfirmDeletionPopUpView({
        el: '#next-step-deletion',
    });
});


