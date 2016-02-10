export default
/*@ngInject*/
() => {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element) {
            element
                .on('click', e => {
                    e.preventDefault()
                    return false;
                })
                .on('mousedown', e => e.preventDefault())
                .attr('tabindex', '-1');
        }
    };
}