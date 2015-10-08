
export default
class KeywordsSpecificationCheckUniqCtrl {
  /*@ngInject*/
  constructor($scope, $http, item) {
    $scope.item = item;

    $scope.sendText = () => {
      $scope.loading = true;
      var el = document.createElement('div');
      el.innerHTML = item.text;
      var text = el.innerText || el.textContent;

      var url = '/api/text-unique';
      $http.post(url, { text: text }).then((res) => {
        item.uid = res.data.text_uid;
        item.$save(() => {
          $scope.getStatus();
        })
      });
    }

    $scope.getStatus = () => {
      $scope.noResult = false;
      $scope.loading = true;
      var url = '/api/text-unique/' + item.uid;
      $http.get(url).then((res) => {
        $scope.result = res.data;
        $scope.loading = false;
      }).catch(() => {
        $scope.result = null;
        $scope.noResult = true;
        $scope.loading = false;
      });
    }


    $scope.saveItem = (item) => {
      $scope.$close(item);
    };

    $scope.close = () => {
      $scope.$dismiss('cancel');
    };

    if (item.uid) {
      $scope.getStatus();
    } else {
      $scope.sendText();
    }
  }
}