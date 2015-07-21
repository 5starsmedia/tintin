export default
class KeywordsReturnTaskCtrl {
  /*@ngInject*/
  constructor($scope, item) {
    $scope.item = item;

    $scope.saveItem = (item) => {
      $scope.$close(item);
    };


    $scope.close = () => {
      $scope.$dismiss('cancel');
    };
  }
}