var copyObjectToScope = (object, scope) => {
    for (var key in object) {
        if (key !== '$$hashKey') {
            scope[key] = object[key];
        }
    }
};

export default
class fbComponentCtrl {
    /*@ngInject*/
    constructor($scope) {

        $scope.copyObjectToScope = function (object) {
            copyObjectToScope(object, $scope);
        };

        $scope.range = function(num) {
            return new Array(num || 0);
        }

    }
}