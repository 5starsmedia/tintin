export default
class SitesSectionsCtrl {
    /*@ngInject*/
    constructor($scope, SiteSectionModel) {

        var loadData = () => {
            $scope.loading = true;
            SiteSectionModel.query(data => {
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