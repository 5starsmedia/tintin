export default
  /*@ngInject*/
  function CommentsCommentModel($resource, $sce) {
    var resource = $resource('/api/comments/:_id/:method', {
      '_id': '@_id'
    }, {
      'get': { method: 'GET' },
      'spam': { method: 'PUT', params: { method: 'spam' } },
      'save': {method: 'PUT'},
      'create': {method: 'POST'},
      'put': {method: 'PUT'},
      'post': {method: 'POST'}
    });
    resource.prototype.getDate = function() {
      return moment(this.createDate).format('DD MMMM YYYY');
    };

    let unflatten = function( array, parent, tree ){

      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : { id: 0 };

      var children = _.filter( array, function(child){ return child.parentComment._id == parent._id; });

      if( !_.isEmpty( children )  ){
        if( !parent._id ){
          tree = children;
        }else{
          parent['comments'] = children
        }
        _.each( children, function( child ){ unflatten( array, child ) } );
      }

      return tree;
    };

    resource.prepareComment = function (comment, canRemove) {
      comment.text = $sce.trustAsHtml(comment.text);
      comment.canRemove = false;
    };

    resource.prepareData = function (comments, canRemove) {
      for (var i = comments.length - 1; i >= 0; i -= 1) {
        this.prepareComment(comments[i], canRemove);
      }
      return unflatten(comments);
    };

    resource.removeComment = function (comments, comment) {
      var self = this;

      resource.delete({_id: comment._id}).$promise.then(() => {
        _.remove(comments, (c) => c.cid.startsWith(comment.cid));
      });
    };

    let lastCommentCid = 0x9000000000;
    resource.getNexCid = function () {
      lastCommentCid += 1;
      return lastCommentCid.toString(16);
    };
    return resource;
  }
