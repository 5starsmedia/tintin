export default
/*@ngInject*/
function attachIssue($modal, IssuesIssueModel, IssuesTypeModel) {
  return {
    restrict: 'A',
    templateUrl: 'views/modules/issues/directive-attach-issue.html',
    scope: {
      'issue': '=attachIssue',
      'attachment': '=',
      'attachmentName': '@'
    },
    link: function (scope, element, attrs) {

      let updateIssue = () => {
        IssuesIssueModel.get({ _id: scope.issue._id }, (issue) => {
          if (issue.issueType) {
            var type = _.find(scope.types, { title: issue.issueType.title });
            if (type) {
              scope.statuses = type.statuses;
              if (!issue.status) {
                issue.status = _.find(type.statuses, { statusType: 'new' });
              }
            }
          }
          scope.issueData = issue;
        });
      };

      scope.$on('updateIssue', () => {
        updateIssue();
      });

      IssuesTypeModel.query((data) => {
        scope.types = data;
      });

      scope.$watch('issueData.issueType._id', (typeId) => {
        if (!typeId) {
          return;
        }
        var type = _.find(scope.types, { _id: typeId });
        console.info(scope.types, type)
        scope.statuses = type.statuses;
      });

      scope.$watch('issue._id', (id) => {
        if (!id) {
          return;
        }
        updateIssue();
      });

      scope.assign = () => {
        var issue = new IssuesIssueModel({
          title: 'Сгенерировать ТЗ по группе ключей "' + scope.attachment.title + '"',
          systemType: 'spec',
          issuePrefix: 'ISS',
          attachments: [{
            resourceId: scope.attachment._id,
            collectionName: scope.attachmentName,
            title: scope.attachment.title
          }]
        });
        var modalInstance = $modal.open({
          templateUrl: 'views/modules/issues/modal-issue.html',
          controller: 'IssuesEditCtrl',
          windowClass: "hmodal-success",
          resolve: {
            issue: () => issue
          }
        });
        modalInstance.result.then((data) => {
          IssuesIssueModel.get(data, (issue) => {
            scope.issue = issue;
          });
        });
      }
    }
  }
};