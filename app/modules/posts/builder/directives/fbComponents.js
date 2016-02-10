export default
/*@ngInject*/
() => {
    return {
        restrict: 'A',
        template: '<ul ng-if="groups.length > 1" class="nav nav-tabs nav-justified">' +
            '<li ng-repeat="group in groups" ng-class="{active:activeGroup==group}">' +
                '<a href="" ng-click="selectGroup($event, group)">{{group}}</a>' +
            '</li>' +
        '</ul>' +
        '<div class="form-horizontal" ng-sortable="sortableOptions">' +
            '<div class="clearfix" ng-repeat="component in components" fb-component="component" editable="false"></div>' +
        '</div>',
        controller: 'fbComponentsCtrl'
    };
}