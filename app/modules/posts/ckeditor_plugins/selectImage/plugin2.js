let execCommand = () => {}, setData = null,
  appName = 'ckeditor.plugin.SelectFiles';
let editorFiles = [];

import SelectImageDialogCtrl from './controllers/SelectImageDialogCtrl.js';

let module = angular.module(appName, []);

module.controller('SelectFileDialogCtrl', SelectImageDialogCtrl);

CKEDITOR.on('dialogDefinition', function(ev) {
  if (ev.data.name == "link") {
    var info = ev.data.definition.getContents("info");
    info.elements.push({
      type: "vbox",
      id: "urlOptions",
      children: [{
        type: "hbox",
        children: [{
          type: "html",
          html: '<div id="myDiv"></div>',
          setup: function(data) {
            var html = '<ol style="padding-left: 20px">';
            editorFiles.forEach(function(item) {
              html += '<li><a href="/api/files/' + item._id + '" data-id="' + item._id + '">' + item.title + '</a></li>'
            });
            html += '</ol>';
            $('#myDiv').html(html);

            $('#myDiv a').click(function() {
              var dialog = ev.data.definition.dialog;
              dialog.setValueOf('info','url', '/api/files/' + $(this).data('id'));  // Populates the URL field in the Links dialogue.
              dialog.setValueOf('info','protocol','');  // This sets the Link's Protocol to Other which loads the file from the same folder the link is on
              return false;
            });
          }
        }]
      }]
    });
  }
});

module.directive('editorSelectFiles', ($modal) => {
  return {
    restrict: 'A',
    scope: false,
    link: ($scope, el, attrs) => {
      $scope.$watch(attrs.editorSelectFiles, function (newValue) {
        if (angular.isUndefined(newValue)) {
          return;
        }
        editorFiles = newValue;
      }, true);
    }
  };
});


export default appName;