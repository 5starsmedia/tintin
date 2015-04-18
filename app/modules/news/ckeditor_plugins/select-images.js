let execCommand = () => {};

CKEDITOR.plugins.add('SelectImages', {
  init: (editor) => {
    editor.addCommand('SelectImagesDialog', {
      exec: execCommand,
      canUndo: false,
      editorFocus : CKEDITOR.env.ie || CKEDITOR.env.webkit
    });
    editor.ui.addButton('SelectImages',
      {
        label: 'Выбрать изображение',
        command: 'SelectImagesDialog',
        icon: '../images/ckeditor/ck-select-images-icon.png',
        toolbar: 'insert'
      });
  }
});

export default
/*@ngInject*/
  function ($modal) {
    let editorImages = [];

    execCommand = (editor) => {
      console.info(editor)
      var modalInstance = $modal.open({
        templateUrl: 'views/modules/news/dialog-chooseimage.html',
        controller: /*@ngInject*/ ($scope, $modalInstance) => {
          $scope.selectedFile = null
          $scope.images = editorImages;
          $scope.onFileSelect = (file) => $scope.selectedFile = file;
          $scope.close = () => $modalInstance.dismiss('cancel');
          $scope.ok = () => $modalInstance.close($scope.selectedFile);
        },
        windowClass: "hmodal-success"
      });
      modalInstance.result.then((file) => {
        console.info(file);
        var img = editor.document.createElement('img');
        img.setAttribute('src', '/api/files/' + file._id);
        editor.insertElement(img);
        editor.widgets.initOn(img, 'image');
      });
    };

    return {
      restrict: 'A',
      scope: false,
      link: ($scope, el, attrs) => {
        $scope.$watch(attrs.editorSelectImages, function (newValue) {
          if (angular.isUndefined(newValue)) {
            return;
          }
          editorImages = newValue;
        }, true);
      }
    };
  };