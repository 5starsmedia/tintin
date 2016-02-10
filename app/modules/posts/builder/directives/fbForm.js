export default
/*@ngInject*/
(fbBuilderPvd) => {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            formName: '@fbForm',
            input: '=ngModel',
            "default": '=fbDefault'
        },
        template: '<div class="fb-form-object" ng-repeat="object in form" fb-form-object="object"></div>',
        controller: 'fbFormCtrl',
        link: function (scope, element, attrs) {
            fbBuilderPvd.forms[scope.formName]  = fbBuilderPvd.forms[scope.formName] || [];

            scope.form = fbBuilderPvd.forms[scope.formName];
        }
    };
}