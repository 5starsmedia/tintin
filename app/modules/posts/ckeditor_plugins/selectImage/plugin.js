let execCommand = () => {}, setData = null,
  appName = 'ckeditor.plugin.SelectImages';

import SelectImageDialogCtrl from './controllers/SelectImageDialogCtrl.js';

let module = angular.module(appName, []);

module.controller('SelectImageDialogCtrl', SelectImageDialogCtrl);


import {widgetDef, alignCommandIntegrator, linkCommandIntegrator} from './widget.js';

CKEDITOR.plugins.add('SelectImages', {
  requires: 'widget',
  icons: 'image',
  hidpi: true,

  onLoad: function() {
    CKEDITOR.addCss(
      '.cke_image_nocaption{' +
        // This is to remove unwanted space so resize
        // wrapper is displayed property.
      'line-height:0' +
      '}' +
      '.cke_image_withpreview { position: relative }' +
      '.cke_image_withpreview:before { position:absolute; top: 4px; right: 4px; z-index: 1; cursor: default; content: " "; background: rgba(255,255,255,.8); width: 24px; height: 24px; border-radius: 50%; }' +
      '.cke_image_withpreview:after { position:absolute; top: 15px; right: 10px; z-index: 2; cursor: default; font-size: 14px; font-family: "FontAwesome"; content: "\\f00e"; color: #000; }' +
      '.cke_editable.cke_image_sw, .cke_editable.cke_image_sw *{cursor:sw-resize !important}' +
      '.cke_editable.cke_image_se, .cke_editable.cke_image_se *{cursor:se-resize !important}' +
      '.cke_image_resizer{' +
      'display:none;' +
      'position:absolute;' +
      'width:10px;' +
      'height:10px;' +
      'bottom:-5px;' +
      'right:-5px;' +
      'background:#000;' +
      'outline:1px solid #fff;' +
        // Prevent drag handler from being misplaced (#11207).
      'line-height:0;' +
      'cursor:se-resize;' +
      '}' +
      '.cke_image_resizer_wrapper{' +
      'position:relative;' +
      'display:inline-block;' +
      'line-height:0;' +
      '}' +
        // Bottom-left corner style of the resizer.
      '.cke_image_resizer.cke_image_resizer_left{' +
      'right:auto;' +
      'left:-5px;' +
      'cursor:sw-resize;' +
      '}' +
      '.cke_widget_wrapper:hover .cke_image_resizer,' +
      '.cke_image_resizer.cke_image_resizing{' +
      'display:block' +
      '}' +
        // Expand widget wrapper when linked inline image.
      '.cke_widget_wrapper>a{' +
      'display:inline-block' +
      '}' );
  },
  init: (editor) => {
    var config = editor.config,
      lang = editor.lang.image2,
      image = widgetDef( editor );

    setData = image.data;

    image.pathName = lang.pathName;
    image.editables.caption.pathName = lang.pathNameCaption;

    editor.widgets.add('SelectImages', image);
    editor.on('doubleclick', (evt) => {
      var element = evt.data.element;
      if (element.is('img') && !element.data('cke-realelement')) {
        execCommand(editor);
      }
      return false;
    });

    editor.addCommand('SelectImagesDialog', {
      exec: execCommand,
      canUndo: false,
      editorFocus : CKEDITOR.env.ie || CKEDITOR.env.webkit
    });
    editor.ui.addButton('SelectImages',
      {
        label: 'Выбрать изображение',
        icon: 'image',
        command: 'SelectImagesDialog',
        toolbar: 'insert,10'
      });

    if ( editor.contextMenu ) {
      editor.addMenuGroup( 'image', 10 );

      editor.addMenuItem( 'image', {
        label: lang.menu,
        command: 'SelectImagesDialog',
        group: 'image'
      } );
    }
  },
  afterInit: function( editor ) {
    // Integrate with align commands (justify plugin).
    var align = { left: 1, right: 1, center: 1, block: 1 },
      integrate = alignCommandIntegrator( editor );

    for ( var value in align )
      integrate( value );

    // Integrate with link commands (link plugin).
    linkCommandIntegrator( editor );
  }
});

module.directive('editorSelectImages', ($modal) => {
  let editorImages = [],
    itemId = null,
    collectionName = null;

  execCommand = (editor) => {
    var modalInstance = $modal.open({
      templateUrl: 'views/modules/news/dialog-chooseimage.html',
      controller: 'SelectImageDialogCtrl',
      resolve: {
        editor: () => editor,
        editorImages: () => editorImages,
        itemId: () => itemId,
        collectionName: () => collectionName,
        setData: () => setData
      },
      windowClass: "hmodal-success"
    });
    modalInstance.result.then((file) => {
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

      attrs.$observe('itemId', (newValue) => {
        if (angular.isUndefined(newValue)) {
          return;
        }
        itemId = newValue;
      });
      attrs.$observe('collectionName', (newValue) => {
        if (angular.isUndefined(newValue)) {
          return;
        }
        collectionName = newValue;
      });
    }
  };
});


export default appName;