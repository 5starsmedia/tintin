export default
class NewsPostsEditCtrl {

  /*@ngInject*/
  constructor($scope, $state, $filter, $stateParams, post, notify, NewsCategoryModel, $http, $sce, postType, KeywordsPublicationModel) {

    $scope.postType = postType;

    post.sections = post.sections || [];
    var oldStatus = post.status;
    $scope.post = post;

    NewsCategoryModel.getTree({ postType: postType, page: 1, perPage: 100 }, (data) => {
      $scope.categories = data;
    });

    KeywordsPublicationModel.query({ postId: post._id }, (data) => {
      $scope.tz = data[0];
      $scope.post.keywordGroup = data[0];
    });

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      delete item.viewsCount;
      delete item.commentsCount;

      if (!item.coverFile) {
        item.coverFile = _.first(item.files)
      }
      if (oldStatus != item.status && item.status == 4) {
        oldStatus = item.status;
        item.publishedDate = new Date();
        item.createDate = new Date();
        console.info(item);
      }
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
    };
    $scope.saveItemPartial = (model) => {
      var item = angular.copy(model);

      if (item.status != 1) {
        return;
      }
      let save = item._id ? item.$save : item.$create;
      delete item.viewsCount;
      delete item.commentsCount;
      save.call(item, (data) => {
        notify({
          message: $filter('translate')('Auto saved!'),
          classes: 'alert-success'
        });
        $scope.post._id = data._id;
        $scope.autosaved = new Date();
      });
    };

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
    };

    $scope.countWords = (str) => {
      return (str || '').split(/\s+/).length;
    };

    $scope.editorOptions = {
      language: 'ru',
      extraPlugins: 'SelectImages,mediaembed,adInsert,showblocks,codesnippet',
      removePlugins: 'image,forms,youtube,autogrow,image2',
      allowedContent: true,
      removeDialogTabs: 'image:advanced;link:advanced',
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
        { name: 'forms', items: [ 'Outdent', 'Indent', 'ShowBlocks', 'CodeSnippet' ] }
      ],
      height: 450
    };


    // forms

    $scope.showSettings = false;
    $scope.hideSettings = () => {
      $scope.showSettings = false;
    };
    $scope.$on('fbChangeActive', (e, component) => {
      $scope.editedItem = component;
      $scope.showSettings = !!component;
    });
    $scope.$on('fbRemoveComponent', (e, component) => {
      $scope.post.sections = _.reject($scope.post.sections, component.object)
    });
  }
}