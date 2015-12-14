export default
class SitesRedirectEditCtrl {
    /*@ngInject*/
    constructor($scope, $state, $filter, $stateParams, item, notify) {

        $scope.item = item;

        $scope.saveItem = (item) => {
            $scope.loading = true;
            let save = item._id ? item.$save : item.$create;
            save.call(item, (data) => {
                $scope.loading = false;
                notify({
                    message: $filter('translate')('Redirect saved!'),
                    classes: 'alert-success'
                });
                $state.go('^.redirectsEdit', { id: data._id });
            }, (res) => {
                $scope.loading = false;
                $scope.error = res.data;
            });
        }
    }
}