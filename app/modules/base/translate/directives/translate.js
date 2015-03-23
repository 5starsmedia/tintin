define(['base/translate/module'], function(app) {

    app.filter('translate', ['$rootScope', function($rootScope) {
        return function(string) {
            var translateBundle = $rootScope.$localeBundle || {};
            return translateBundle[string] || string;
        };
    }]);

});