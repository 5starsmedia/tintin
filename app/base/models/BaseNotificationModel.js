export default
  /*@ngInject*/
  function BaseNotificationModel($resource) {
    var resource = $resource('/api/notifications/:method/:_id', {
      '_id': '@_id'
    }, {
      'put': {method: 'PUT'},
      'markAsRead': { method: 'POST', params: { method: 'mark-as-read'} },
      'markAsRead2': { method: 'POST', params: {isPopupVisible: true} },
      'markAsRead3': { method: 'POST', params: {isPopupVisible: true} }
    });
    return resource;
  }
