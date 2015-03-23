let editorImages = [];

CKEDITOR.plugins.add('SelectImages',
  {
    init: function (editor) {
      editor.addCommand('selectImagesDialog', new CKEDITOR.dialogCommand('selectImagesDialog'));
      editor.ui.addButton('SelectImages',
        {
          label: 'Выбрать изображение',
          command: 'selectImagesDialog',
          icon: '../images/ckeditor/ck-select-images-icon.png',
          toolbar: 'insert'
        });
    }
  });

CKEDITOR.dialog.add('selectImagesDialog', function (editor) {
  return {
    title: 'Выбор изображения',
    minWidth: 450,
    minHeight: 200,
    contents: [
      {
        id: 'tab-basic',
        label: '',
        elements: [
          {
            type: 'select',
            id: 'selimg',
            label: 'Прикрепленные файлы',
            items: [],
            onShow: function (e) {
              var elId = this.getInputElement().$.id,
                contId = elId + '_cont',
                i = 0,
                l = editorImages.length;

              $('#' + elId).hide();
              if ($('#' + contId).size() == 0) {
                $('#' + elId).after('<ul class="gallery" id="' + contId + '"></ul>');
              } else {
                $('#' + contId).empty();
              }

              for (; i < l; i++) {
                var image = editorImages[i],
                  file = image.url;
                if (file.substring(0, 8) != '/uploads') {
                  file = '/uploads' + file;
                }
                $('#' + contId).append('<li class="item"><label>' +
                '<input type="radio" name="' + elId + '" value="' + file + '"/>' +
                '<img style="width: 50px" src="' + image.thumbnailUrl + '"/>' + //editorImages[i][0] +
                '</label></li>');
              }
              $('#' + contId + ' label').click(function () {
                $('#' + contId + ' li').removeClass('active');
                $(this).parent().addClass('active');
              });
            }
          }
        ]
      }
    ],
    onOk: function () {
      var dialog = this,
        elId = dialog.getContentElement('tab-basic', 'selimg').getInputElement().$.id,
        val = $('input[name="' + elId + '"]:checked').val();

      if (val) {
        var img = editor.document.createElement('img');
        img.setAttribute('src', val);
        editor.insertElement(img);
        editor.widgets.initOn(img, 'image');
      }
    }
  };
});


export default
/*@ngInject*/
  function ($parse, $compile, $interpolate) {
    return {
      restrict: 'A',
      scope: false,
      link: function ($scope, el, attrs) {
        $scope.$watch(attrs.editorSelectImages, function (newValue) {
          if (angular.isUndefined(newValue)) {
            return;
          }
          editorImages = newValue;
        }, true);
      }
    };
  };