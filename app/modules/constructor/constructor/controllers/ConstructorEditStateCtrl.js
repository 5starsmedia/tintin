export default
class ConstructorEditStateCtrl {
  /*@ngInject*/
  constructor($scope, $modalInstance, item, parent, eventType, ConstructorStateModel) {

    $scope.item = item;
    $scope.settings = {
      haveComment: !!item.comment
    };
    $scope.$watch('item.comment', (comment) => {
      if (comment) {
        $scope.settings.haveComment = true;
      }
    });

    $scope.stateTypesGroups = [
      {
        title: 'Users',
        states: [{
          title: 'Send E-mail',
          name: 'send.email'
        }, {
          title: 'Send notification',
          name: 'send.notification'
        }]
      },
      {
        title: 'Groups',
        states: [{
          title: 'Send E-mail for group',
          name: 'send.email.group'
        }]
      },
      {
        title: 'Actions',
        states: []
      },
      {
        title: 'Conditions',
        states: [{
          title: 'Is spam?',
          name: 'if.spam',
          captions: [{ title: 'Yes' }, { title: 'No' }]
        }]
      }
    ];

    $scope.setType = (type) => {
      $scope.item.title = type.title;
      $scope.item.stateType = type.name;
      $scope.item.captions = type.captions;
    };

    $scope.saveItem = () => {
      $scope.loading = true;
      if (!$scope.settings.haveComment) {
        item.comment = '';
      }
      if (!item._id) {
        ConstructorStateModel.create({'_id': parent._id, before: true}, item, (item) => {
          $scope.loading = false;
          $modalInstance.close(item);
        }, () => {
          $scope.loading = false;
        });
      } else {
        item.$save(() => {
          $scope.loading = false;
          $modalInstance.close(item);
        });
      }
    };

    $scope.remove = (item) => {
      $scope.loading = true;
      ConstructorStateModel.delete({ _id: item._id }, () => {
        $scope.loading = false;
        $modalInstance.close();
      });
    };

    $scope.close = () => {
      $modalInstance.dismiss();
    };

  }
}