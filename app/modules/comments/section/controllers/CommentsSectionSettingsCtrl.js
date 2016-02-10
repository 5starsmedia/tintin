export default
class CommentsSectionSettingsCtrl {
    /*@ngInject*/
    constructor($scope) {

        $scope.$watch('settings.tabs', (tabs) => {
            if (!angular.isArray(tabs)) {
                return;
            }
            _.each(tabs, (tab, n) => {
                if (!angular.isUndefined(tab.$$active)) {
                    return;
                }
                tab.$$active = n == 0;
            });
        }, true);

        $scope.newTab = () => {
            $scope.component.settings = $scope.component.settings || {};
            $scope.component.settings.tabs = $scope.component.settings.tabs || [];
            $scope.component.settings.tabs.push({
                $$active: true
            });
        };

        $scope.removeTab = (tab) => {
            var tab = _.find($scope.component.settings.tabs, { $$active: true });
            $scope.component.settings.tabs = $scope.component.settings.tabs || [];
            $scope.component.settings.tabs = _.without($scope.component.settings.tabs, tab);
            if (tab.$$active) {
                tab = _.first($scope.component.settings.tabs);
                if (tab) {
                    tab.$$active = true;
                }
            }
        };

        $scope.tabsConfig = {
            group: 'tabs',
            animation: 150,
            forceFallback: true
        };

    }
}