export default
class SitesRedirectsCtrl {
    /*@ngInject*/
    constructor($scope, SiteRedirectModel) {

        var loadData = () => {
            $scope.loading = true;
            SiteRedirectModel.query(data => {
                $scope.loading = false;
                $scope.redirects = data;
            });
        };
        loadData();


        $scope.remove = function(item) {
            $scope.loading = true;
            item.$delete(function() {
                $scope.loading = false;

                loadData();
            })
        };
    }
}