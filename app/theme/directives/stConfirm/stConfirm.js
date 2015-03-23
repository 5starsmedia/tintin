export default
  /*@ngInject*/
  function ($parse, $window) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        var callback = $parse(attrs.stConfirm),
          title = $parse(attrs.messageTitle)(scope),
          message = $parse(attrs.message)(scope);

        element.click(function () {

          $window.swal({
            title: title,
            text: message,
            type: attrs.type || "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            closeOnConfirm: true,
            closeOnCancel: true
          }, function (isConfirm) {

            if (isConfirm) {
              callback(scope, {});

              if (!scope.$$phase) {
                scope.$apply();
              }
            }
          });

        });
      }
    };
  }