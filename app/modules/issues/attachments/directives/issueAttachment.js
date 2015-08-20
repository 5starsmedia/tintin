export default
/*@ngInject*/
function issueAttachment($modal) {
  return {
    restrict: 'A',
    templateUrl: 'views/modules/issues/attachments/directive-issue-attachment.html',
    scope: {
      'attachments': '=issueAttachment'
    },
    link: function (scope, element, attrs) {

      scope.addAttachment = () => {
        var modalInstance = $modal.open({
          templateUrl: 'views/modules/issues/attachments/modal-attachments.html',
          controller: 'IssuesAttachmentsCtrl',
          windowClass: "hmodal-success"
        });
        modalInstance.result.then((data) => {
          console.info(data)
        });
      }
    }
  }
};