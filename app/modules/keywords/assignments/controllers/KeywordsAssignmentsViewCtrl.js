export default
class KeywordsAssignmentsViewCtrl {
  /*@ngInject*/
  constructor($scope, $state, group, notify, $filter, NewsPostModel, NewsCategoryModel, post, SiteDomainModel, $modal, KeywordsPublicationModel) {
    $scope.group = group;

    SiteDomainModel.getCurrent((site) => {
      $scope.site = site;
    });

    NewsCategoryModel.getTree({ page: 1, perPage: 100, postType: 'post' }, (data) => {
      $scope.categories = data;
    });
/*
    $scope.post = (post && post[0]) || new NewsPostModel({
      title: group.title,
      status: 3,
      postType: 'post',
      category: group.category,
      keywordGroup: {
        _id: group._id
      },
      account: {
        _id: group.result.account._id,
        title: group.result.account.title
      }
    });*/

    $scope.back = (status) => {
      $scope.loading = true;
      group.status = status;
      group.$save((data) => {
        $scope.loading = false;
        if (status == 'inwork') {
          notify({
            message: $filter('translate')('Get in work!'),
            classes: 'alert-success'
          });
          $state.go('^.assignments');
        }
      }, (err) => {
        $scope.loading = false;
      });
    };

    $scope.savePost = (item) => {
      $scope.loading = true;
      group.status = 'moderation';
      group.$save((data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('On moderation'),
          classes: 'alert-success'
        });
        $state.go('^.assignments');
      }, (err) => {
        $scope.loading = false;
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

    $scope.refuse = (group) => {
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/keywords/assignments/modal-refuse.html',
        controller: 'KeywordsAssignmentsRefuseCtrl',
        windowClass: "hmodal-success",
        resolve: {
          group: () => angular.copy(group)
        }
      });
      modalInstance.result.then((data) => {
        notify({
          message: $filter('translate')('Отказ от ТЗ отправлен редактору'),
          classes: 'alert-success'
        });
        $state.go('^.assignments');
      });
    };

    $scope.getInWork = (group) => {
      $scope.loading = true;

      var publication = new KeywordsPublicationModel({
        title: group.title,
        category: group.category,
        account: group.result.account,
        dueDate: group.result.dueDate,
        group: {
          _id: group._id
        },
        textLength: {
          min: group.recomendation.minTextLength,
          max: group.recomendation.maxTextLength
        },
        keywords: group.recomendation.keywords,
        urls: _.filter(group.result.urls, { use: true })
      })
      publication.$create((data) => {
        group.$delete(() => {
          $state.go('keywords.specificationsView', { _id: data._id })
        });
      })
    };
  }
}