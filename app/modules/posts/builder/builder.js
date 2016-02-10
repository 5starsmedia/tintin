var appName = 'module.forms.builder';

let module = angular.module(appName, [
    'ng-sortable'
]);

//providers
import fbBuilderPvd from './providers/fbBuilderPvd.js';
module
    .provider('fbBuilderPvd', fbBuilderPvd)
;

// controllers
import fbComponentsCtrl from './controllers/fbComponentsCtrl.js';
import fbComponentCtrl from './controllers/fbComponentCtrl.js';
import fbFormCtrl from './controllers/fbFormCtrl.js';
module
    .controller('fbComponentsCtrl', fbComponentsCtrl)
    .controller('fbComponentCtrl', fbComponentCtrl)
    .controller('fbFormCtrl', fbFormCtrl)
;

//directives
import fbBuilder from './directives/fbBuilder.js';
import fbComponent from './directives/fbComponent.js';
import fbComponents from './directives/fbComponents.js';
import fbEditableComponent from './directives/fbEditableComponent.js';
import fbComponentSettings from './directives/fbComponentSettings.js';
import fbTemplateElement from './directives/fbTemplateElement.js';
import fbForm from './directives/fbForm.js';
module
    .directive('fbBuilder', fbBuilder)
    .directive('fbComponent', fbComponent)
    .directive('fbComponents', fbComponents)
    .directive('fbEditableComponent', fbEditableComponent)
    .directive('fbComponentSettings', fbComponentSettings)
    .directive('fbTemplateElement', fbTemplateElement)
    .directive('fbForm', fbForm)
;

// config
module.config((fbBuilderPvdProvider) => {

    fbBuilderPvdProvider
        .registerComponent('commentsSection', {
            group: 'Default',
            name: 'Comments section',
            defaults: {
                title: 'Обсуждения',
                tabs: [
                    {title: 'Новые', commentCount: 5, sorting: { field: 'createDate', direction: 'desc' } },
                    {title: 'Популярные', commentCount: 5, sorting: { field: 'answerCount', direction: 'desc' }}
                ]
            },
            templateUrl: 'views/sections/comments.html',
            settingsTemplateUrl: 'views/sections/comments-settings.html'
        });

    fbBuilderPvdProvider
        .registerComponent('rowSpliter', {
            group: 'Containers',
            defaults: {
                title: 'Text Input',
                body: '<b>Some</b> <i>cool</i> text'
            },
            templateUrl: 'views/sections/containers/row.html',
            settingsTemplateUrl: 'views/sections/containers/row-settings.html'
        });

}).run((SiteSectionModel, fbBuilderPvd, $templateCache) => {

    SiteSectionModel.query(data => {
        fbBuilderPvd.components = {};

        _.each(data, section => {
            $templateCache.put('section' + section._id, section.htmlCode);
            fbBuilderPvd
                .registerComponent('section' + section._id, {
                    group: 'Default',
                    label: section.title,
                    defaults: {
                        title: 'Text Input',
                        body: '<b>Some</b> <i>cool</i> text'
                    },
                    templateUrl: 'section' + section._id,
                    settingsTemplateUrl: 'views/sections/text-settings.html'
                });
        });
    });

});

export default appName;