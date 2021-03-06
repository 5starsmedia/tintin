export default
class KeywordsSpecificationViewCtrl {
  /*@ngInject*/
  constructor($scope, $state, group, notify, $filter, SiteDomainModel, $modal, NewsCategoryModel) {
    $scope.item = group;

    SiteDomainModel.getCurrent((site) => {
      $scope.site = site;
    });

    NewsCategoryModel.getTree({ page: 1, perPage: 100, postType: 'post' }, (data) => {
      $scope.categories = data;
      console.info(data)
    });

    $scope.back = (status) => {
      $scope.loading = true;
      group.status = status;
      group.$save((data) => {
        $scope.loading = false;
        if (status == 'completed') {
          notify({
            message: $filter('translate')('Group back!'),
            classes: 'alert-success'
          });
          $state.go('^.specifications');
        }
      }, (err) => {
        $scope.loading = false;
      });
    };

    $scope.saveDraftItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      item.status = 'inprocess';
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Draft saved!'),
          classes: 'alert-success'
        });
        //$state.go('^.specifications');
        $state.go('^.specificationsView', { _id: data._id });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };
    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      item.status = 'completed';
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Публикация отправлена на проверку!'),
          classes: 'alert-success'
        });
        $state.go('^.specifications');
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    $scope.returnToAuthor = () => {
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/keywords/specifications/form-backToAuthor.html',
        controller: 'KeywordsReturnTaskCtrl',
        resolve: {
          item: () => {
            return $scope.group;
          }
        }
      });

      $scope.loadingBack = true;
      modalInstance.result.then(function (item) {
        item.status = 'returned';
        item.$save(() => {
          $scope.loadingBack = false;
          notify({
            message: $filter('translate')('Return to author!'),
            classes: 'alert-success'
          });
          $state.go('^.specifications');
        }, (res) => {
          $scope.loadingBack = false;
          $scope.error = res.data;
        });
      }, function () {
        $scope.loadingBack = false;
      });
    };

    $scope.checkForUniq = () => {
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/keywords/specifications/modal-checkUniq.html',
        controller: 'KeywordsSpecificationCheckUniqCtrl',
        resolve: {
          item: () => {
            return $scope.item;
          }
        }
      });

      $scope.loadingBack = true;
      modalInstance.result.then(function (item) {
      }, function () {
      });
    };

    $scope.editorOptions = {
      language: 'ru',
      extraPlugins: 'SelectImages,mediaembed,adInsert,showblocks',
      removePlugins: 'image,forms,youtube,autogrow,image2',
      allowedContent: true,
      toolbar: [
        { name: 'controls', items: [ 'Undo', 'Redo' ] },
        { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord' ] },
        { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
        { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
        { name: 'insert', items: [ 'Image', 'SelectImages', 'MediaEmbed', 'adInsert', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
        { name: 'special', items: [ 'Maximize', 'Source' ] },
        '/',
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', 'Underline' ] },
        { name: 'paragraph', items: [ 'BulletedList', 'NumberedList', 'Blockquote' ] },
        { name: 'styles', items: [ 'Format', 'FontSize', 'RemoveFormat' ] },
        { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
        { name: 'forms', items: [ 'Outdent', 'Indent', 'ShowBlocks' ] }
      ],
      height: 450
    };
  }
}