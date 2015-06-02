function Node(tree, id, parentId, title, stateType, caption, params, comment) {
  this.tree = tree;
  this.treeId = tree.params.treeId;
  this.id = id;
  this.title = title;
  this.parentId = parentId;
  this.stateType = stateType;
  this.caption = caption;
  this.params = params;
  this.comment = comment;
  this.width = 150;

  function cb(object, fnc, sendTarget) {
    return function () {
      if (sendTarget !== undefined && sendTarget == true) {
        var args = [this];
        for (var i in arguments) args.push(arguments[i]);
      } else {
        var args = arguments;
      }
      return fnc.apply(object, args);
    }
  }

  this.createDiv = function (left) {
    if (this.stateType == 'hidden') return $('<div>');
    var nodeDiv = $('<div>', {
      'class': 'node',
      width: this.width,
      id: 'node_' + this.treeId + '_' + this.id
    }).css('margin-left', left);
    var type = {
        "width": 100,
        "params": [],
        'image': true,
        "color": "blue"
      },
      draggable = type.draggable;
    if (draggable === undefined || draggable != false) {
      nodeDiv.addClass('drag-node');
    }
    if (this.parentId == '0') {
      nodeDiv.addClass('start-node');
    }

    if (this.comment && this.comment.text !== undefined && this.comment.text != '') {
      var comment = $('<div>', {
        'class': 'node-comment node-comment-' + type.color
      });
      comment.css({
        'left': this.comment.x,
        'top': this.comment.y,
        'width': this.comment.sx,
        'height': this.comment.sy
      });

      comment.append(
        $('<div>', {id: 'node_comment_' + this.comment.id, 'class': 'node-comment-text-table'}).append(
          $('<div>', {'class': 'node-comment-text-row'}).append(
            $('<div>', {'class': 'node-comment-text'}).html(
              this.comment.text
            )
          )
        )
      );
      nodeDiv.append(
        $('<div>', {'class': 'node-comment-wrapper'}).append(
          comment
        )
      );
    }


    var box = $('<div>', {
      'class': 'box'
    });
    if (this.stateType == 'empty') {
      box.addClass('empty-box');
    }
    if (this.stateType == 'end') {
      box.addClass('end-box');
    }

    if (this.caption) {
      var nodeCaption = $('<span>', {
        'class': 'node-caption'
      });
      nodeCaption.append(this.caption);
      box.append(nodeCaption, '<br/>')
    }

    var image = type.image,
      imageDiv = $('<div>', {
        'class': 'node-image'
      });

    box.append(imageDiv);
    if (image !== undefined && image != '') {
      imageDiv.append('<img src="assets/images/tree/' + this.stateType + '.png"/><br/>');
    }

    var nodeDescr = $('<div>', {
      'class': 'node-descr'
    });

    var title = this.title;
    if (title !== undefined && title != '' && this.stateType != 'empty') {
      nodeDescr.append(title);
    }

    var nodeParams = $('<div>', {
      'class': 'node-params'
    });

    this.params.label && nodeParams.append(this.params.label);

    nodeParams.appendTo(nodeDescr);
    if (this.stateType != 'empty') {
      nodeDescr.appendTo(box);
    }


    var delayedSending = false;
    var waitingForReply = false;
    angular.forEach(this.params.conditions, function (condition) {
      if (condition.stateType == 'I') {
        waitingForReply = true;
      }
      if (condition.stateType == 'T') {
        delayedSending = true;
      }
    });
    if (delayedSending) {
      imageDiv.append('<img class="node-icon node-icon-wait" title="Отложенное выполнение события" src="assets/images/tree/wait.png" />');
    }
    if (waitingForReply) {
      imageDiv.append('<img class="node-icon node-icon-warn" title="Ожидание входящего сообщения" src="assets/images/tree/warn.png" />');
    }
    /*if (this.params.item.state && this.params.item.state.id != 'S' && this.type != 'end' && !this.params.item.state.active) {
     imageDiv.append('<img class="node-icon node-icon-alert" title="Внимание! Вы не настроили это действие" src="assets/images/tree/alert.png" />');
     }*/

    box.appendTo(nodeDiv);

    var self = this;
    box.on('click', function () {
      if (self.stateType === 'empty' || self.stateType === 'end') {
        self.tree.onNodeCreate(self);
      } else {
        self.tree.onNodeClick(self);
      }
    });
    return nodeDiv;
  }
}