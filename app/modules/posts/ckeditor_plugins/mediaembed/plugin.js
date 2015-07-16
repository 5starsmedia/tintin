CKEDITOR.plugins.add('mediaembed',
  {
    icons: 'mediaembed', // %REMOVE_LINE_CORE%
    hidpi: true, // %REMOVE_LINE_CORE%
    init: function (editor) {
      var me = this;
      CKEDITOR.dialog.add('MediaEmbedDialog', function (instance) {
        return {
          title: 'Embed Media',
          minWidth: 550,
          minHeight: 200,
          contents: [
            {
              id: 'iframe',
              expand: true,
              elements: [{
                id: 'embedArea',
                type: 'textarea',
                label: 'Paste Embed Code Here',
                'autofocus': 'autofocus',
                setup: function (element) {
                },
                commit: function (element) {
                }
              }]
            }
          ],
          onOk: function () {
            var div = instance.document.createElement('div');
            div.setHtml(this.getContentElement('iframe', 'embedArea').getValue());
            instance.insertElement(div);
          }
        };
      });

      editor.addCommand('MediaEmbed', new CKEDITOR.dialogCommand('MediaEmbedDialog',
        {allowedContent: 'iframe[*]'}
      ));

      editor.ui.addButton('MediaEmbed',
        {
          label: 'Embed Media',
          command: 'MediaEmbed',
          icon: '../images/ckeditor/mediaembed/mediaembed.png',
          toolbar: 'mediaembed'
        });
    }
  });
