export default
class EcommerceEditFieldCtrl {
  /*@ngInject*/
  constructor($scope, item, $modalInstance, $filter) {

    $scope.item = item;

    $scope.fieldTypes = [
      {id: 'checkbox', title: $filter('translate')('Чекбокс (Да/Нет)')},
      {id: 'text', title: $filter('translate')('Текст')},
      {id: 'number', title: $filter('translate')('Число')},
      {id: 'list', title: $filter('translate')('Выпадающий список')},
      {id: 'checkbox-list', title: $filter('translate')('Список чекбоксов')},
      {id: 'separator', title: $filter('translate')('Разделитель')}
    ];

    $scope.sortableConfig = {
      group: 'fields',
      handle: '.drag-handle',
      animation: 150,
      onSort: (event) => {
        _.forEach(event.models, (model, n) => {
          model.ordinal = n;
        });
      }
    };

    $scope.saveItem = function () {
      $scope.loading = true;

      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;
        $modalInstance.close(item);
      });
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.addVariant = function (item) {
      item.fieldData = item.fieldData || [];
      item.fieldData.push({
        value: '',
        ordinal: item.fieldData.length + 1
      });
    };
    $scope.removeVariant = function (item, i) {
      delete item.data[i];
    }
  }
}