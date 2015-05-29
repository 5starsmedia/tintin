export default
class EcommerceEditAttributesCtrl {
  /*@ngInject*/
  constructor($scope, $sce, $filter, EcommerceFieldModel, EcommerceTypeModel, $rootScope) {


    var loadFields = (id) => {
      $scope.loading = true;
      EcommerceFieldModel.query({
        page: 1,
        perPage: 200,
        'productType._id': id,
        sort: 'ordinal'
      }, function (data, headers) {
        $scope.loading = false;
        //params.total(headers('x-total-count'));
        var fields = [],
          fieldData = {};
        _.forEach(data, function (item) {
          var field = {
            _id: item._id,
            title: item.title,
            ordinal: item.ordinal,
            fieldType: item.fieldType,
            value: item.value,
            values: []
          };
          var productField = _.find($scope.item.productFields, {_id: item._id});
          if (productField) {
            field.isFilled = productField.isFilled;
            field.value = productField.value;
            field.values = productField.values;
          }
          fields.push(field);
          fieldData[item._id] = item.fieldData;
        });
        $scope.fieldData = fieldData;
        $scope.item.productFields = fields;
      }, function () {
        $scope.loading = false;
      });
    };

    $scope.$watch('item.productType._id', function (id) {
      if (angular.isUndefined(id)) {
        return;
      }
      loadFields(id);
    });

    EcommerceTypeModel.getTree({page: 1, perPage: 200}, function (data) {
      //walk(data, 0);
      $scope.types = data;
    });
  }

}