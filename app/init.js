import config from './config';
import appName from './app';

window.config = config;

angular.element(document).ready(function () {
    angular.bootstrap(document, [appName]);
});