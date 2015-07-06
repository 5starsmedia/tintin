export default
class AdsSettingsCtrl {
  /*@ngInject*/
  constructor($scope, AdsCodeModel, notify, $filter) {

    $scope.codes = [];

    $scope.places = [
      { id: 'before-post', title: 'Перед текстом' },
      { id: 'in-text', title: 'В тексте' },
      { id: 'after-post', title: 'После текста' },
      { id: 'header', title: 'В шапке' },
      { id: 'footer', title: 'Вконце сайта' }
    ];

    var loadData = () => {
      $scope.loading = true;
      AdsCodeModel.query({page: 1, perPage: 10}, (res) => {
        $scope.loading = false;
        $scope.codes = res;
        $scope.code = new AdsCodeModel({title: 'Code #' + (res.length + 1), htmlCode: ''});
      });
    };
    loadData();

    $scope.createAd = (item) => {
      $scope.loading = true;
      let isCreate = !item._id;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;

        notify({
          message: $filter('translate')('Saved!'),
          classes: 'alert-success'
        });
        if (isCreate) {
          loadData();
        }
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    $scope.deleteItem = (item) => {
      $scope.loadingDelete = true;
      item.$delete(() => {
        $scope.loadingDelete = false;
        loadData();
      });
    }
  }
}