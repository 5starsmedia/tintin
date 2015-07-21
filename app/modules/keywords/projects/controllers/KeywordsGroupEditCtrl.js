export default
class KeywordsGroupEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, project, group, notify, $filter, KeywordsUrlPreview, $timeout, NewsCategoryModel, SiteDomainModel) {
    $scope.project = project;
    $scope.group = group;

    $scope.keywords = (group.keywords || '').split("\n");

    SiteDomainModel.getCurrent((site) => {
      $scope.site = site;
    });

    NewsCategoryModel.getTree({ page: 1, perPage: 100 }, (data) => {
      $scope.categories = data;
    });

    $scope.getLink = () => {
      return location.origin + '/preview/keyword-group/' + group._id;
    };

    $scope.runScan = () => {
      $scope.loadingScan = true;
      group.$runScan(() => {
        $scope.loadingScan = false;
      }, (err) => {
        $scope.loadingScan = false;
        if (err.status == 400) {
          $scope.error = err.data.msg;

          $timeout(() => {
            $scope.error = null;
          }, 4000)
        }
      });
    };

    $scope.back = (status) => {
      $scope.loading = true;
      group.status = status;
      group.$save((data) => {
        $scope.loading = false;
        if (status == 'editorValidation') {
          notify({
            message: $filter('translate')('Group submitted to the work!'),
            classes: 'alert-success'
          });
          $state.go('^.projectView', { id: project._id });
        }
      }, (err) => {
        $scope.loading = false;
      });
    };

    $scope.nextStep = () => {
      $scope.loading = true;

      if (group.status == 'finded') {
        group.status = 'completed';
      }
      group.$save(() => {
        if (group.status == 'completed') {
          $scope.loading = false;
          return;
        }
        group.$scanKeywords(() => {
          $scope.loading = false;
        }, (err) => {
          $scope.loading = false;
        });
      }, (err) => {
        $scope.loading = false;
      });
    };

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Group saved!'),
          classes: 'alert-success'
        });
        $state.go('^.groupEdit', { id: data._id, projectId: project._id });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    $scope.activeUrl = null;
    $scope.previewUrl = (url) => {
      $scope.activeUrl = url;
      $scope.loadingPreview = true;
      KeywordsUrlPreview.getPreview({ url: url }, (data) => {
        $scope.loadingPreview = false;
        $scope.parsedData = data;
      });
    }


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