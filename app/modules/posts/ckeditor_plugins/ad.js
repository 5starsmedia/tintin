let execCommand = () => {};

CKEDITOR.plugins.add('adInsert', {
  requires: 'widget',

  icons: 'adInsert',

  init: (editor) => {
    editor.widgets.add( 'adInsert', {
      button: 'Create a simple box',
      template: '<figure class="b-ad-place">[reklama]</figure>',

      allowedContent:
        'figure(!b-ad-place)',

      requiredContent: 'figure(b-ad-place)',

      upcast: function( element ) {
        return element.name == 'figure' && element.hasClass( 'b-ad-place' );
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