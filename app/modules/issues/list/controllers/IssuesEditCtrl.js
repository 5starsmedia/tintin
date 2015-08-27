export default
class IssuesEditCtrl {

  /*@ngInject*/
  constructor($scope, $state, $filter, issue, notify, IssuesTypeModel) {
    $scope.item = issue;

    IssuesTypeModel.query((data) => {
      $scope.types = data;
      if (issue.systemType) {
        var type = _.find($scope.types, { systemType: issue.systemType });
        if (type) {
          issue.issueType = type;
        }
      }
      if (issue.issueType) {
        var type = _.find($scope.types, { title: issue.issueType.title });
        if (type) {
          $scope.statuses = type.statuses;
          if (!issue.status) {
            issue.status = _.find(type.statuses, { statusType: 'new' });
          }
        }
      }
    });

    $scope.$watch('item.issueType', (type) => {
      if (!type) {
        return;
      }
      $scope.statuses = type.statuses;
    });

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      delete item.viewsCount;
      delete item.commentsCount;
      delete item.systemType;
      save.call(item, (data) => {
        $scope.loading = false;
        //$state.go('news.posts');
        notify({
          message: $filter('translate')('Saved!'),
          classes: 'alert-success'
        });
        if ($scope.$close) {
          $scope.$close({ _id: data._id });
        } else {
          $state.go('^.edit', {id: data._id});
        }
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