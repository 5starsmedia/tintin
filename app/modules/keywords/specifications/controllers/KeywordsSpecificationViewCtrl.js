export default
class KeywordsSpecificationViewCtrl {
  /*@ngInject*/
  constructor($scope, $state, group, notify, $filter) {
    $scope.group = group;

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

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Specifications saved!'),
          classes: 'alert-success'
        });
        $state.go('^.specifications');
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