import AuthenticatedRoute from 'ghost/routes/authenticated';
import styleBody from 'ghost/mixins/style-body';
import ShortcutsRoute from 'ghost/mixins/shortcuts-route';
import ctrlOrCmd from 'ghost/utils/ctrl-or-cmd';

var shortcuts = {},
    SettingsUserRoute;

shortcuts[ctrlOrCmd + '+s'] = {action: 'save'};

SettingsUserRoute = AuthenticatedRoute.extend(styleBody, ShortcutsRoute, {
    titleToken: 'User',

    classNames: ['settings-view-user'],

    model: function (params) {
        var self = this;
        // TODO: Make custom user adapter that uses /api/users/:slug endpoint
        // return this.store.find('user', { slug: params.slug });

        // Instead, get all the users and then find by slug
        return this.store.find('user').then(function (result) {
            var user = result.findBy('slug', params.slug);

            if (!user) {
                return self.transitionTo('error404', 'settings/users/' + params.slug);
            }

            return user;
        });
    },

    afterModel: function (user) {
        var self = this;
        this.store.find('user', 'me').then(function (currentUser) {
            var isOwnProfile = user.get('id') === currentUser.get('id'),
                isAuthor = currentUser.get('isAuthor'),
                isEditor = currentUser.get('isEditor');
            if (isAuthor && !isOwnProfile) {
                self.transitionTo('settings.users.user', currentUser);
            } else if (isEditor && !isOwnProfile && !user.get('isAuthor')) {
                self.transitionTo('settings.users');
            }
        });
    },

    deactivate: function () {
        var model = this.modelFor('settings.users.user');

        // we want to revert any unsaved changes on exit
        if (model && model.get('isDirty')) {
            model.rollback();
        }

        this._super();
    },

    shortcuts: shortcuts,

    actions: {
        save: function () {
            this.get('controller').send('save');
        }
    }
});

export default SettingsUserRoute;
