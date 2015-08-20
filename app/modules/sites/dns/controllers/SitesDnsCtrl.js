export default
class SitesDnsCtrl {
  /*@ngInject*/
  constructor($scope, SiteDnsDomainModel, SiteDnsRecordModel, $modal) {

    var loadData = () => {
      SiteDnsDomainModel.query({name: $scope.site.domain}, (sites) => {
        if (!sites.length) {
          return;
        }
        $scope.domain = sites[0];
        SiteDnsRecordModel.query({'domain._id': $scope.domain._id}, (data) => {
          $scope.records = data;
        })
      });
    };

    $scope.editRecord = (record) => {
      record = record || new SiteDnsRecordModel({
          domain: $scope.domain
        });
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/sites/dns/modal-record.html',
        controller: 'SitesDnsRecordEditCtrl',
        windowClass: "hmodal-success",
        resolve: {
          item: () => angular.copy(record)
        }
      });
      modalInstance.result.then(() => {
        loadData();
      });
    };

    loadData();

  }
}