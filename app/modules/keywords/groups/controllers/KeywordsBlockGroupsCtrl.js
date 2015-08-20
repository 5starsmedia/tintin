export default
class KeywordsBlockGroupsCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsGroupModel) {

    $scope.loading = true;
    KeywordsGroupModel.query({ page: 1, perPage: 100 }, function (groups, headers) {
      $scope.loading = false;
      $scope.groups = groups;
    });

  }
}