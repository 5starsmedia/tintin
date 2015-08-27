export default
/*@ngInject*/
function IssuesSrc(IssuesIssueModel, IssuesTypeModel) {

  this.setStatus = (issueId, statusType, callback) => {

    IssuesIssueModel.get({ _id: issueId }, (issue) => {
      IssuesTypeModel.get({ _id: issue.issueType._id }, (issueType) => {

        var status = _.find(issueType.statuses, { statusType: statusType });

        if (!status) {
          return;
        }
        issue.status = status;
        issue.$save(() => {
          callback(issue);
        });
      });
    });
  };

};