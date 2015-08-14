export default
class SitesSettingsCtrl {
  /*@ngInject*/
  constructor($scope, site, $filter, notify) {
    site.meta = site.meta || {};
    $scope.site = site;

    $scope.editorOptions = {
      language: 'ru',
      removePlugins: 'image,forms,youtube,autogrow',
      allowedContent: true,
      toolbar: [
        { name: 'controls', items: [ 'Undo', 'Redo' ] },
        { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord' ] },
        { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
        { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
        { name: 'special', items: [ 'Maximize', 'Source' ] },
        '/',
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', 'Underline' ] },
        { name: 'paragraph', items: [ 'BulletedList', 'NumberedList', 'Blockquote' ] },
        { name: 'styles', items: [ 'Format', 'FontSize', 'RemoveFormat' ] },
        { name: 'forms', items: [ 'Outdent', 'Indent' ] }
      ],
      height: 450
    };

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Settings saved!'),
          classes: 'alert-success'
        });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    }
  }
}