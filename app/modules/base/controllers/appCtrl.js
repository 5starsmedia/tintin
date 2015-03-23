const SCOPE = new WeakMap();
const TIMEOUT = new WeakMap();
const HTTP = new WeakMap();

const quotes = [
  ['Никогда не следует хорошо говорить о себе. Следует это печатать.', 'Жюль Валлес'],
  ['Газета приучает читателя размышлять о том, чего он не знает, и знать то, что не понимает.', 'Василий Ключевский'],
  ['Вечером семья собиралась у синего окна во вселенную.', 'Виктор Пелевин. Спи'],
  ['Он нашел на свалке старый телевизор и поставил посреди комнаты как символ веры.', 'Мартен Паж. Как я стал идиотом'],
  ['Газеты — секундные стрелки истории.', 'Артур Шопенгауэр'],
  ['Но газетчику надо уметь видеть и мелкий виноград, а не только крупный арбуз.', 'Рэй Брэдбери. Вино из одуванчиков'],
  ['Странные существа эти журналисты. Они должны быть невероятно высокого мнения о себе, чтобы оставаться способными делать свою работу.', 'Джеффри Линдсей. Деликатесы Декстера'],
  ['Современные средства информации хороши тем, что дают нам возможность ворчать в глобальном масштабе.', 'Лоуренс Питер'],
  ['Разносчиками малярии являются комары, а безумия — Средства массовой информации.', 'Бернар Миньер. Лёд'],
  ['В настоящей журналистике есть и четко разделены: факт, комментарий, мнение. Когда все это «в одном флаконе» – это не журналистика, а пропаганда.', 'Александр Сергеевич Запесоцкий'],
  ['Вообще говоря, прессу кормят несчастья.', 'Клемент Эттли'],
  ['Где мифы сами не растут, там их активно насаждают.', 'Елена Ермолова'],
  ['Средства массовой информации не менее опасны, чем средства массового уничтожения.', 'Петр Капица'],
  ['Нападать на журналистов так же бессмысленно, как сражаться с женщинами. Если ты проигрываешь, то выглядишь глупо; если выигрываешь — глупо вдвойне.', 'Александр Лебедь'],
  ['Свобода прессы работает таким образом, что от неё не остаётся никакой свободы.', 'Грейс Келли'],
  ['Чем гласность отличается от свободы слова? Умением красноречиво промолчать.', 'Игорь Красновский']
], randQuote = Math.floor((Math.random() * quotes.length));

export default class appCtrl
{
  get quote() {
    return quotes[randQuote];
  }

  get title() {
    return this.appTitle;
  }

  /*@ngInject*/
  constructor($http, $scope, $timeout, appTitle)
  {
    TIMEOUT.set(this, $timeout);
    HTTP.set(this, $http);
    SCOPE.set(this, $scope);

    this.appTitle = appTitle;

    // For iCheck purpose only
    $scope.checkOne = true;

    /**
     * Sparkline bar chart data and options used in under Profile image on left navigation panel
     */

    $scope.barProfileData = [5, 6, 7, 2, 0, 4, 2, 4, 5, 7, 2, 4, 12, 11, 4];
    $scope.barProfileOptions = {
      type: 'bar',
      barWidth: 7,
      height: '30px',
      barColor: '#62cb31',
      negBarColor: '#53ac2a'
    };
    $scope.chartIncomeData = [
      {
        label: "line",
        data: [[1, 10], [2, 26], [3, 16], [4, 36], [5, 32], [6, 51]]
      }
    ];

    $scope.chartIncomeOptions = {
      series: {
        lines: {
          show: true,
          lineWidth: 0,
          fill: true,
          fillColor: "#64cc34"

        }
      },
      colors: ["#62cb31"],
      grid: {
        show: false
      },
      legend: {
        show: false
      }
    };

    /**
     * Tooltips and Popover - used for tooltips in components view
     */
    $scope.dynamicTooltip = 'Hello, World!';
    $scope.htmlTooltip = "I\'ve been made <b>bold</b>!";
    $scope.dynamicTooltipText = 'Dynamic';
    $scope.dynamicPopover = 'Hello, World!';
    $scope.dynamicPopoverTitle = 'Title';

    /**
     * Pagination - used for pagination in components view
     */
    $scope.totalItems = 64;
    $scope.currentPage = 4;

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };

    /**
     * Typehead - used for typehead in components view
     */
    $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    // Any function returning a promise object can be used to load values asynchronously
    $scope.getLocation = function (val) {
      return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: val,
          sensor: false
        }
      }).then(function (response) {
        return response.data.results.map(function (item) {
          return item.formatted_address;
        });
      });
    };

    /**
     * Rating - used for rating in components view
     */
    $scope.rate = 7;
    $scope.max = 10;

    $scope.hoveringOver = function (value) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / this.max);
    };

    /**
     * groups - used for Collapse panels in Tabs and Panels view
     */
    $scope.groups = [
      {
        title: 'Dynamic Group Header - 1',
        content: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. '
      },
      {
        title: 'Dynamic Group Header - 2',
        content: 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was created for the bliss of souls like mine. '
      }
    ];

    $scope.oneAtATime = true;

    /**
     * Some Flot chart data and options used in Dashboard
     */

    var data1 = [[0, 55], [1, 48], [2, 40], [3, 36], [4, 40], [5, 60], [6, 50], [7, 51]];
    var data2 = [[0, 56], [1, 49], [2, 41], [3, 38], [4, 46], [5, 67], [6, 57], [7, 59]];

    $scope.chartUsersData = [data1, data2];
    $scope.chartUsersOptions = {
      series: {
        splines: {
          show: true,
          tension: 0.4,
          lineWidth: 1,
          fill: 0.4
        },
      },
      grid: {
        tickColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: 'f0f0f0',
        color: '#6a6c6f'
      },
      colors: ["#62cb31", "#efefef"],
    };


    /**
     * Some Pie chart data and options
     */

    $scope.PieChart = {
      data: [1, 5],
      options: {
        fill: ["#62cb31", "#edf0f5"]
      }
    };

    $scope.PieChart2 = {
      data: [226, 360],
      options: {
        fill: ["#62cb31", "#edf0f5"]
      }
    };
    $scope.PieChart3 = {
      data: [0.52, 1.561],
      options: {
        fill: ["#62cb31", "#edf0f5"]
      }
    };
    $scope.PieChart4 = {
      data: [1, 4],
      options: {
        fill: ["#62cb31", "#edf0f5"]
      }
    };
    $scope.PieChart5 = {
      data: [226, 134],
      options: {
        fill: ["#62cb31", "#edf0f5"]
      }
    };
    $scope.PieChart6 = {
      data: [0.52, 1.041],
      options: {
        fill: ["#62cb31", "#edf0f5"]
      }
    };

    $scope.BarChart = {
      data: [5, 3, 9, 6, 5, 9, 7, 3, 5, 2],
      options: {
        fill: ["#dbdbdb", "#62cb31"],
      }
    };

    $scope.LineChart = {
      data: [5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 4, 7, 3, 2, 9, 8, 7, 4, 5, 1, 2, 9, 5, 4, 7],
      options: {
        fill: '#62cb31',
        stroke: '#62cb31',
        width: 64
      }
    };


    $scope.stanimation = 'bounceIn';
    $scope.runIt = true;
    $scope.runAnimation = function () {

      $scope.runIt = false;
      $timeout(function () {
        $scope.runIt = true;
      }, 100)

    };

  }
}