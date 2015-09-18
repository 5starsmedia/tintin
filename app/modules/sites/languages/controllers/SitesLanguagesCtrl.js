export default
class SitesLanguagesCtrl {
  /*@ngInject*/
  constructor($scope, site, SiteDomainModel, notify, $filter) {

    site.allowLocales = site.allowLocales || [];
    $scope.site = site;

    $scope.sortableConfig = {
      group: 'fields',
      handle: '.drag-handle',
      animation: 150,
      onSort: (event) => {
        _.forEach(event.models, (model, n) => {
          model.ordinal = n;
        });
      }
    };

    $scope.addLocale = (locale) => {
      $scope.site.allowLocales.push(locale);
      $scope.site.allowLocales = _.unique($scope.site.allowLocales, 'code');
      $scope.addLocales = localesList();
    };
    $scope.removeLocale = (locale) => {
      $scope.site.allowLocales = _.without($scope.site.allowLocales, locale);
      $scope.addLocales = localesList();
    };

    $scope.saveItem = (item) => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;
      save.call(item, (data) => {
        $scope.loading = false;
        notify({
          message: $filter('translate')('Languages saved!'),
          classes: 'alert-success'
        });
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    var localesList = () => {
      if (!$scope.locales) {
        return [];
      }
      return _.filter($scope.locales, (locale) => {
        return !_.find(site.allowLocales, { code: locale.code });
      });
    };

    $scope.loading = true;
    SiteDomainModel.getLocales((data) => {
      $scope.loading = false;

      $scope.locales = data;

      if (!$scope.site.allowLocales.length) {
        $scope.site.allowLocales.push(_.find(data, { code: site.defaultLocale }));
      }
      $scope.addLocales = localesList();
    });

  }
}