export default
/*@ngInject*/
function () {
    return function (input, defaultString) {
        let str = _.trim(input || '');
        if (str == '') {
            return defaultString;
        }
        return input;
    };
};