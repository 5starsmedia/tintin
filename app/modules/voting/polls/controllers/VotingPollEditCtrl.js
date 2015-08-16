export default
class VotingPollEditCtrl {

  /*@ngInject*/
  constructor($scope, $state, $filter, item, notify, $modal) {

    $scope.item = item;

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      delete item.viewsCount;
      delete item.commentsCount;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Poll saved!'),
          classes: 'alert-success'
        });
        $state.go('^.edit', {id: data._id});
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
        {name: 'controls', items: ['Undo', 'Redo']},
        {name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord']},
        {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
        {name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
        {
          name: 'insert',
          items: ['Image', 'SelectImages', 'MediaEmbed', 'adInsert', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']
        },
        {name: 'special', items: ['Maximize', 'Source']},
        '/',
        {name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'Underline']},
        {name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote']},
        {name: 'styles', items: ['Format', 'FontSize', 'RemoveFormat']},
        {name: 'colors', items: ['TextColor', 'BGColor']},
        {name: 'forms', items: ['Outdent', 'Indent', 'ShowBlocks']}
      ],
      height: 450
    };

    $scope.editChoise = (choise) => {

      var modalInstance = $modal.open({
        templateUrl: 'views/modules/voting/form-choise.html',
        controller: 'VotingChoiseEditCtrl',
        windowClass: "hmodal-success",
        resolve: {
          item: function () {
            return choise || {};
          }
        }
      });
      modalInstance.result.then((item) => {
        $scope.item.choices = $scope.item.choices || [];

        if (!choise) {
          $scope.item.choices.push(item);
        }
      });

    };

    $scope.remove = (choise) => {
      $scope.item.choices = _.without($scope.item.choices, choise);
    };
  }
}