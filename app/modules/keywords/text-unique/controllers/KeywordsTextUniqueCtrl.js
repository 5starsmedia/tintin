export default
class KeywordsTextUniqueCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsTextUniqueModel) {

    $scope.item = {
      text: ''
    };

    $scope.checkText = (item) => {
      $scope.loading = true;
      KeywordsTextUniqueModel.checkText({}, item, () => {
        $scope.loading = false;
      })
    }

  }
}