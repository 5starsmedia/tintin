export default
  /*@ngInject*/
  () => {
    var id = 1;

    return {
      restrict: 'A',
      replace: false,
      scope: {
        'tree': '=constructorTree',
        'onStateCreate': '&',
        'onStateClick': '&',
        'onStateInsert': '&'
      },
      templateUrl: 'views/modules/constructor/directive-constructorTree.html',
      link: (scope, element, attrs) => {

        let createTree = (treeData) => {
          let elemId = 'tree' + id;
          element.attr('id', elemId);

          let tree = new Tree({
            treeId: id,
            data: _.map(treeData, (node) => {
              return {
                id: node._id,
                draggable: false,
                title: node.title,
                parentId: node.parentId || '0',
                stateType: node.parentId ? node.stateType : node.eventType,
                params: {
                  item: node,
                  label: node.comment,
                  captions: node.captions
                }
              };
            })
          });

          tree.appendTo(element.find('.tree_wrapper').html(''));
          id++;

          tree.onNodeClick = (node) => {
            if (node.id == 'S') {
              return;
            }
            scope.onStateClick({ $state: node.params.item });
          };

          tree.onNodeCreate = (node) => {
            scope.onStateCreate({ $state: node.params.item });
          };
          tree.onNodeInsert = (node) => {
            scope.onStateInsert({ $state: node.params.item });
          }
        };

        scope.$watch('tree', (data) => {
          if (angular.isUndefined(data)) {
            return;
          }
          createTree(data);
        }, true);
      }
    };
  }