export default
class IssuesAttachmentsCtrl {

  /*@ngInject*/
  constructor($scope, $modalInstance) {


    $scope.addAttachment = function () {
      $modalInstance.close(item);
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }
}