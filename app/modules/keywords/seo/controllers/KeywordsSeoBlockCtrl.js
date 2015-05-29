export default
class KeywordsBlockGroupsCtrl {
  /*@ngInject*/
  constructor($scope, KeywordsSeoTaskModel, notify, $filter, NgTableParams, BaseAPIParams, KeywordsSeoStatHistoryModel, $timeout) {

    $scope.updateSeoPositions = () => {
      KeywordsSeoTaskModel.runTasks({ collectionName: 'posts', resourceId: $scope.post._id }, () => {
        notify({
          message: $filter('translate')('Article is added to queue for scan'),
          classes: 'alert-success'
        });
        $scope.tableParams.reload();
      });
    };

    $scope.reloadLog = () => {
      $scope.tableParams.reload();
    };

    $scope.options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 60,
          left: 55
        },
        x: function(d){ return d.label; },
        y: function(d){ return d.value; },
        showValues: true,
        valueFormat: function(d){
          return d3.format(',.4f')(d);
        },
        transitionDuration: 500,
        xAxis: {
          axisLabel: 'X Axis'
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: 30
        }
      }
    };

    var loadData = () => {
      KeywordsSeoStatHistoryModel.getMonth({'collectionName': 'posts', 'resourceId': $scope.post._id}, (data) => {
        $scope.data = [{
          key: "Cumulative Return",
          values: [
            { "label" : "A" , "value" : -29.765957771107 },
            { "label" : "B" , "value" : 0 },
            { "label" : "C" , "value" : 32.807804682612 },
            { "label" : "D" , "value" : 196.45946739256 },
            { "label" : "E" , "value" : 0.19434030906893 },
            { "label" : "F" , "value" : -98.079782601442 },
            { "label" : "G" , "value" : -13.925743130903 },
            { "label" : "H" , "value" : -5.1387322875705 }
          ]
        }]

        $scope.lineData = {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
              label: "Example dataset",
              fillColor: "rgba(220,220,220,0.5)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [22, 44, 67, 43, 76, 45, 12]
            },
            {
              label: "Example dataset",
              fillColor: "rgba(98,203,49,0.5)",
              strokeColor: "rgba(98,203,49,0.7)",
              pointColor: "rgba(98,203,49,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(26,179,148,1)",
              data: [16, 32, 18, 26, 42, 33, 44]
            }
          ]
        };



        var endDate = moment(),
          startDate = moment(endDate).subtract(1,'month'),
          cursor = moment(startDate);

        endDate.add(1,'day');
        var tableData = {}, dates = [], prevValues = {}, diff;
        while (cursor.isBefore(endDate)) {
          dates.push(cursor.format('DD.MM.YYYY'));
          _.forEach(data.google, (item) => {
            tableData[item.label] = tableData[item.label] || [];
            tableData[item.label].push({ title: cursor.format('DD.MM.YYYY'), value: '-', class: 'active' });
            var tableItem = tableData[item.label][tableData[item.label].length - 1];

            _.forEach(item.data, (date) => {
              if (moment(date[0]).isSame(cursor, 'day')) {
                if (prevValues[item.label]) {
                  diff = date[1] - prevValues[item.label];
                }
                tableItem.value = date[1];
                tableItem.diff = diff;
                if (diff != 0 && diff) {
                  tableItem.class = diff > 0 ? 'danger' : 'success';
                  tableItem.showDiff = Math.abs(diff);
                } else {
                  tableItem.class = '';
                }
                prevValues[item.label] = date[1];
                diff = 0;
              }
            });
          });
          cursor.add(1,'day');
        }
        $scope.dates = dates;
        $scope.tableData = tableData;

      });
    };
    loadData();


    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10,
      sorting: {
        createDate: 'desc'
      }
    }, {
      getData: function($defer, params) {
        $scope.loading = true;
        KeywordsSeoTaskModel.query(BaseAPIParams({ 'url.collectionName': 'posts', 'url.resourceId': $scope.post._id }, params),
          (logs, headers) =>{
            $scope.loading = false;
            $scope.logs = logs;
            $defer.resolve(logs);
            params.total(headers('x-total-count'));
          });
      }
    });

  }
}