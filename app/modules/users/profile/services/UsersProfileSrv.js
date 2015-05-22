export default
  /*@ngInject*/
  function UsersProfileSrv($q, $auth, UserAccountModel) {
    this.getAccountId = function () {
      if (!$auth.isAuthenticated()) {
        return null;
      }
      var payload = $auth.getPayload();
      if (!payload._id) {
        return null;
      }
      return payload._id;
    };

    this.changeRole = function (roleId, callback) {
      if (!$auth.isAuthenticated()) {
        return null;
      }
      UserAccountModel.changeRole({ role_id: roleId }, (data) => {
        $auth.setToken(data.token);
        var payload = $auth.getPayload();
        callback(payload.role_id);
      });

      var payload = $auth.getPayload();
      if (!payload._id) {
        return null;
      }
      return payload._id;
    };

    this.getAccountInfo = function (success, error) {
      var id = this.getAccountId();
      if (!id) {
        return null;
      }
      return UserAccountModel.getAccountInfo({_id: id}, success, error);
    };

    return {
      getAccountInfo: this.getAccountInfo,
      getAccountId:   this.getAccountId,
      changeRole:     this.changeRole
    };
  }
