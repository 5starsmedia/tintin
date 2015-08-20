export default
/*@ngInject*/
function issueResourceLink($modal) {
  return {
    restrict: 'A',
    templateUrl: 'views/modules/issues/attachments/directive-resource-link.html',
    scope: {
      'resource': '=issueResourceLink'
    },
    link: function (scope, element, attrs) {
    }
  }
};