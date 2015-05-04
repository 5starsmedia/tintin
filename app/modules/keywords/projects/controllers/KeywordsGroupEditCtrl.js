export default
class KeywordsGroupEditCtrl {
  /*@ngInject*/
  constructor($scope, $state, project, group, notify, $filter, KeywordsUrlPreview, $timeout) {
    $scope.project = project;
    $scope.group = group;

    $scope.keywords = (group.keywords || '').split("\n");

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
      group.$save(() => {
        $scope.loading = false;
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
  }
}