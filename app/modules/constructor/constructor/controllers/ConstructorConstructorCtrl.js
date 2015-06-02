export default
class ConstructorConstructorCtrl {
  /*@ngInject*/
  constructor($scope, ConstructorStateModel, $modal) {

    var eventType = 'comment.add';

    var loadData = () => {
      $scope.loading = true;
      ConstructorStateModel.query({ eventType: eventType, sort: '_w' }, (data) => {
        $scope.loading = false;

        $scope.tree = data;
      });
    };
    loadData();

    $scope.onStateCreate = function(node) {
      $scope.onStateEdit({ eventType: eventType }, node);
    };
    $scope.onStateInsert = function(node) {
      $scope.onStateEdit({ eventType: eventType }, node);
    };
    $scope.onStateEdit = function(node, parent) {
      if (node.stateType == 'start') {
        return;
      }
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/constructor/modal-editState.html',
        controller: 'ConstructorEditStateCtrl',
        windowClass: "hmodal-success",
        size: 'lg',
        resolve: {
          item: () => node,
          eventType: () => eventType,
          parent: () => parent
        }
      });
      modalInstance.result.then(() => {
        loadData();
      });
    };
  }
}