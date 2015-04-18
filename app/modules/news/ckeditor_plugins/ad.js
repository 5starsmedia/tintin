let execCommand = () => {};

CKEDITOR.plugins.add('adInsert', {
  requires: 'widget',

  icons: 'adInsert',

  init: (editor) => {
    editor.widgets.add( 'adInsert', {
      button: 'Create a simple box',
      template: '<figure class="ad-box">[reklama]</figure>',

      allowedContent:
        'figure(!ad-box)',

      requiredContent: 'figure(ad-box)',

      upcast: function( element ) {
        return element.name == 'figure' && element.hasClass( 'ad-box' );
      }
    } );

    editor.ui.addButton( 'adInsert',
      {
        label : 'Insert ad',
        toolbar : 'insert',
        command : 'adInsert',
        icon: '../images/ckeditor/ad-insert.png'
      });
  }
});