export default
class NewsPostsEditCtrl {

  /*@ngInject*/
  constructor($scope, $state, $filter, $stateParams, post, notify, NewsCategoryModel, $http, $sce) {

    $scope.post = post;

    NewsCategoryModel.query({ page: 1, perPage: 100 }, (data) => {
      $scope.categories = data;
    });

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      //delete item.files;
      save.call(item, (data) => {
        $scope.loading = false;
        //$state.go('news.posts');
        notify({
          message: $filter('translate')('Article saved!'),
          classes: 'alert-success'
        });
        $state.go('^.edit', { id: data._id });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    }

    $scope.tags = [];
    $scope.loadTags = function (x) {
      if (x == '') {
        $scope.tags = [];
        return;
      }
      $http.get('/api/posts/tags-complete?term=' + encodeURIComponent(x)).success(function (data) {
        $scope.tags = data;
      });
    };
    $scope.toTag = function (text) {
      var item = {
        title: text
      };
      return item;
    };
    $scope.trustAsHtml = function(value) {
      return $sce.trustAsHtml(value);
    };



    $scope.sources = [];
    $scope.loadSources = function (x) {
      if (x == '') {
        $scope.sources = [];
        return;
      }
      $http.get('/api/posts/source-complete?term=' + encodeURIComponent(x)).success(function (data) {
        $scope.sources = data;
      });
    };
    $scope.selectSource = (item, model) => {
      $scope.post.source = item.title;
    }

    $scope.countWords = (str) => {
      return (str || '').split(/\s+/).length;
    };

    $scope.editorOptions = {
      language: 'ru',
      extraPlugins: 'SelectImages,mediaembed,adInsert,showblocks',
      removePlugins: 'image,forms,youtube,autogrow,image2',
      allowedContent: true,
      toolbar: [
        { name: 'controls', items: [ 'Undo', 'Redo' ] },
        { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord' ] },
        { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
        { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
        { name: 'insert', items: [ 'Image', 'SelectImages', 'MediaEmbed', 'adInsert', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
        { name: 'special', items: [ 'Maximize', 'Source' ] },
        '/',
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', 'Underline' ] },
        { name: 'paragraph', items: [ 'BulletedList', 'NumberedList', 'Blockquote' ] },
        { name: 'styles', items: [ 'Format', 'FontSize', 'RemoveFormat' ] },
        { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
        { name: 'forms', items: [ 'Outdent', 'Indent', 'ShowBlocks' ] }
      ],
      height: 450
    };
  }
}