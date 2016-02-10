export default
class SitesSectionEditCtrl {
    /*@ngInject*/
    constructor($scope, $state, $filter, $stateParams, item, notify) {

        $scope.item = item;

        $scope.cssEditorOptions = {
            useWrapMode : true,
            showGutter: true,
            theme:'eclipse',
            mode: 'scss',
            firstLineNumber: 1
        };

        $scope.htmlEditorOptions = {
            useWrapMode : true,
            showGutter: true,
            theme:'eclipse',
            mode: 'html',
            firstLineNumber: 1
        };

        $scope.saveItem = (item) => {
            $scope.loading = true;
            let save = item._id ? item.$save : item.$create;
            save.call(item, (data) => {
                $scope.loading = false;
                notify({
                    message: $filter('translate')('Section saved!'),
                    classes: 'alert-success'
                });
                $state.go('^.sectionsEdit', { id: data._id });
            }, (res) => {
                $scope.loading = false;
                $scope.error = res.data;
            });
        }
    }
}