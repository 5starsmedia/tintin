export default
class KeywordsGroupEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, group, notify, $filter, KeywordsUrlPreview, $timeout,
              NewsCategoryModel, SiteDomainModel, KeywordsGroupModel, IssuesSrc) {
    $scope.group = group;

    $scope.keywords = (group.keywords || '').split("\n");

    SiteDomainModel.getCurrent((site) => {
      $scope.site = site;
    });

    NewsCategoryModel.getTree({ page: 1, perPage: 100, postType: 'post' }, (data) => {
      $scope.categories = data;
      console.info(data)
    });

    $scope.runScan = () => {
      $scope.loadingScan = true;

      IssuesSrc.setStatus(group.issue._id, 'inprogress', (issue) => {
        $scope.$broadcast('updateIssue');

        group.$save((data) => {
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
        });
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
          $state.go('^.groups');
        }
      }, (err) => {
        $scope.loading = false;
      });
    };

    $scope.nextStep = (step) => {
      $scope.loading = true;

      if (group.status == 'finded') {
        group.status = 'completed';
      }
      if (step == 'complete') {
        IssuesSrc.setStatus(group.issue._id, 'validation', (issue) => {
          $scope.$broadcast('updateIssue');

          group.$save(() => {
            $scope.loading = false;
            notify({
              message: $filter('translate')('Saved!'),
              classes: 'alert-success'
            });
            $state.go('^.groups');
          });
        });
        return;
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
        $state.go('^.groupEdit', { id: data._id });
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
    };

    $scope.$watch('group.issue', (newIssue, oldIssue) => {
      if (!newIssue) {
        return;
      }

      KeywordsGroupModel.save({
        _id: $scope.group._id,
        issue: newIssue
      });
      console.info(newIssue)
    });

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