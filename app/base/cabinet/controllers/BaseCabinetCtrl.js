export default
class BaseCabinetCtrl {
  /*@ngInject*/
  constructor($scope, BaseMenuModel) {

    BaseMenuModel.query(function(data) {
      $scope.menu = data;
    })

  }
}