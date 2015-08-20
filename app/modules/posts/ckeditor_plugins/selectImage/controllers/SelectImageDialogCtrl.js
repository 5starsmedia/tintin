export default
class SelectImageDialogCtrl {
  /*@ngInject*/
  constructor($scope, $modalInstance, editor, editorImages, setData, itemId, collectionName) {
    var widget = editor.widgets.focused;
    $scope.widgetData = ( widget && widget.name == 'SelectImages' ) ? widget.data : { width: 350 };
    $scope.widgetData.lock = true;
    $scope.isCustomWidth = false;
    $scope.itemId = itemId;
    $scope.collectionName = collectionName;

    let selectedId = ($scope.widgetData.src) ? $scope.widgetData.src.replace('/api/files/', '') : null,
      getHeight = (width) => {
        width = parseInt(width);
        if (!width || !widget) {
          return null;
        }
        let natural = CKEDITOR.plugins.SelectImages.getNatural(widget.parts.image);
        return Math.round(natural.height * (width / natural.width));
      };

    $scope.showAttributes = !!selectedId;
    $scope.selectedFile = _.find(editorImages, { '_id' : selectedId });
    $scope.images = editorImages;

    $scope.imageSizes = [
      { title: 'Small', width: 200 },
      { title: 'Medium', width: 350 },
      { title: 'Large', width: 500 }
    ];
    $scope.$watch('widgetData.width', () => $scope.widgetData.height = getHeight($scope.widgetData.width) );
    if ($scope.widgetData.width && !_.find($scope.imageSizes, { width: parseInt($scope.widgetData.width) })) {
      $scope.isCustomWidth = true;
    }

    $scope.setWidth = (width) => {
      $scope.widgetData.width = width;
      $scope.isCustomWidth = false;
    };
    $scope.setCustom = (width) => {
      $scope.isCustomWidth = true;
    };

    $scope.onFileSelect = (file) => {
      $scope.selectedFile = file;
      if (!$scope.widgetData.alt) {
        $scope.widgetData.alt = file.title;
      }
      $scope.showAttributes = true;
    };

    $scope.close = () => $modalInstance.dismiss('cancel');

    $scope.ok = () => {
      $scope.loading = true;
      if (!widget) {
        var img = editor.document.createElement('img');
        img.setAttribute('src', '/api/files/' + $scope.selectedFile._id);
        editor.insertElement(img);
        widget = editor.widgets.initOn(img, 'SelectImages');
      }
      let imgLoad = new Image();
      imgLoad.src = '/api/files/' + $scope.selectedFile._id;
      imgLoad.onload = () => {
        $scope.$apply(() => {
          $scope.widgetData.src = '/api/files/' + $scope.selectedFile._id;
          if ($scope.widgetData.width) {
            $scope.widgetData.height = Math.round(imgLoad.height * ($scope.widgetData.width / imgLoad.width));
          }
          _.forEach($scope.widgetData, (value, key) => {
            widget.setData(key, value);
          });
          setData.call(widget);
          $scope.loading = false;
          setTimeout(() => { editor.fire( 'change' ); }, 1)
          $modalInstance.close($scope.selectedFile);
        });
      };
      imgLoad.onerror = () => {
        $scope.loading = false;
        $scope.error = true;
      };
    }
  }
}