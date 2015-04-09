export default
class EcommerceEditCategoryCtrl {
  /*@ngInject*/
  constructor($scope, item, $state, EcommerceTypeModel, EcommerceFieldModel, $modal, notify, $filter, $q) {
    $scope.item = item;

    var loadFields = () => {
      EcommerceFieldModel.query({ page: 1, perPage: 200, 'productType._id': item._id, sort: 'ordinal' }, function (data, headers) {
        $scope.loading = false;
        //params.total(headers('x-total-count'));
        $scope.fields = data;
      }, function () {
        $scope.loading = false;
      });
    };
    loadFields();

    $scope.$watch('tree', function(tree) {
      if (angular.isUndefined(tree)) {
        return;
      }
      var parents = [], editedItem = EcommerceTypeModel.find(tree, function (item) {
        return item._id == $scope.item._id;
      }, parents);
      $scope.editedItem._id = editedItem._id;
      parents.shift();
      _.forEach(parents, function (node) {
        node.$expanded = true;
      });
    });

    $scope.editField = function (field) {
      field = angular.copy(field) || new EcommerceFieldModel({
        productType: {
          _id: item._id,
          title: item.title
        },
        fieldData: [],
        fieldType: 'checkbox',
        ordinal: 0
      });

      var modalInstance = $modal.open({
        templateUrl: 'views/modules/ecommerce/types/form-field.html',
        controller: 'EcommerceEditFieldCtrl',
        windowClass: "hmodal-success",
        resolve: {
          item: function () {
            return field;
          }
        }
      });
      modalInstance.result.then(() => {
        loadFields();
      });
    };

    $scope.remove = function (field) {
      $scope.loading = true;
      field.$delete(function () {
        $scope.loading = false;
      })
    };


    $scope.saveItem = function (item) {
      var category = angular.copy(item);
      $scope.loading = true;
      delete category.children;
      delete category.$settings;
      delete category.$loading;
      delete category.id;
      delete category.focus;
      delete category.depth;
      delete category.path;
      delete category.__v;
      delete category._w;
      $scope.error = null;
      category.$save((data) => {
        $scope.loading = false;
        item.url = data.url;

        notify({
          message: $filter('translate')('Item saved!'),
          classes: 'alert-success'
        });
        $scope.$emit('UpdateTree');
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };


    $scope.cancel = function () {
      $scope.editedItem._id = null;
      $state.go('ecommerce.types');
    };


    $scope.sortableConfig = {
      group: 'fields',
      handle: '.drag-handle',
      animation: 150,
      onSort: (event) => {
        var defs = [];
        $scope.fieldsLoading = true;
        _.forEach(event.models, (model, n) => {
          model.ordinal = n;
          var def = model.$save();
          defs.push(def);
        });
        $q.all(defs).then(function() {
          $scope.fieldsLoading = false;
        })
      }
    };

  }
}