export default
class fbFormCtrl {
    /*@ngInject*/
    constructor($scope, fbBuilderPvd, $timeout) {

        $scope.input = $scope.input || [];

        $scope.$watch('form', () => {
            if ($scope.input.length > $scope.form.length) {
                $scope.input.splice($scope.form.length);
            }
            $timeout(() => {
                $scope.$broadcast(fbBuilderPvd.broadcastChannel.updateInput);
            });
        }, true);

    }
}