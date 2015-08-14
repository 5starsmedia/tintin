export default
class VotingChoiseEditCtrl {

  /*@ngInject*/
  constructor($scope, $modalInstance, item) {
    $scope.item = item;

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.saveItem = function (item) {
      $modalInstance.close(item)
    };
  }
}