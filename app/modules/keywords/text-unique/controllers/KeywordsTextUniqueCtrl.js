export default
class KeywordsTextUniqueCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsTextUniqueModel) {

    $scope.item = {
      text: ''
    };
    $scope.uid = '55813afd479d7';

    $scope.checkText = (item) => {
      $scope.loading = true;
      KeywordsTextUniqueModel.checkText({}, item, (res) => {
        $scope.loading = false;
        $scope.uid = res.id;
      })
    };

    $scope.checkStatus = () => {
      $scope.loading = true;
      KeywordsTextUniqueModel.checkStatus({ uid: $scope.uid }, (res) => {
        $scope.result = res;
        $scope.loading = false;
      })
    };

  }
}