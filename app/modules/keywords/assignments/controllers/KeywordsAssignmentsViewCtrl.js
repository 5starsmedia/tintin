export default
class KeywordsAssignmentsViewCtrl {
  /*@ngInject*/
  constructor($scope, $state, group, notify, $filter, NewsPostModel, NewsCategoryModel, post) {
    $scope.group = group;

    NewsCategoryModel.getTree({ page: 1, perPage: 100 }, (data) => {
      $scope.categories = data;
    });

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
    });

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
      let save = item._id ? item.$save : item.$create;
      delete item.viewsCount;
      delete item.commentsCount;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Article saved!'),
          classes: 'alert-success'
        });
        $state.go('^.assignments');
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
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