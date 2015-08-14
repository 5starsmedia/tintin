function Tree(params) {
  this.defaults = {treeId: 0};
  this.nodes = [];
  this.sortedNodes = {};
  this.arrows = [];
  this.width = 0;
  this.params = params || {};
  this.nodeWidth = 150;

  var readonly = false;
  this.onNodeClick = function (node) {
  };

  this.onNodeCreate = function (node) {
  };

  this.onNodeInsert = function (node) {
  };

  this.start = function () {
    var nodes = this.nodes = [];
    this.sortedNodes = {};
    this.arrows = [];

    this.createNodes(this.params.data || {});
    this.sortNodes();
  };

  this.createNodes = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var nodeArray = nodes[i];
      var nodeObject = new Node(this, nodeArray['id'], nodeArray['parentId'], nodeArray['title'], nodeArray['stateType'], nodeArray['caption'], nodeArray['params'], nodeArray['comment']);
      this.nodes.push(nodeObject);
    }
  };

  this.sortNodes = function () {
    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      if (this.sortedNodes[node.parentId] === undefined) this.sortedNodes[node.parentId] = [];
      this.sortedNodes[node['parentId']].push(node);
    }
  };

  this.render = function (block) {
    this.start();
    block.append(this.createContainer());
    this.drawArrows();
    //this.configDragAndDrop();
  };

  this.createContainer = function () {
    var containerDiv = $('<div>', {
      'class': 'tree-container'
    });
    var rootLayer = new Layer(this.sortedNodes[0][0], null);
    this.createChildLayersRecursive(rootLayer);
    containerDiv.css('width', rootLayer.width);
    this.width = rootLayer.width;
    this.renderLayerRecursive(rootLayer, containerDiv);
    this.createClearDiv().appendTo(containerDiv);

    return containerDiv;
  };

  this.createChildLayersRecursive = function (layer) {
    var childNodes = this.sortedNodes[layer.node.id];
    var childLayersWidth = 0;
    if (childNodes !== undefined && childNodes.length > 0) {
      for (var i = 0; i < childNodes.length; i++) {
        if (layer.node.params.captions && layer.node.params.captions[i]) {
          childNodes[i].caption = layer.node.params.captions[i].title;
        }
        var childLayer = new Layer(childNodes[i], layer);
        this.createChildLayersRecursive(childLayer);
        layer.childs.push(childLayer);
        childLayersWidth += childLayer.width;
      }
    }
    layer.width = Math.max(childLayersWidth, layer.node.width);
    layer.nodeLeft = 0;
    if (layer.childs.length == 1) {
      layer.nodeLeft = layer.childs[0].nodeLeft;
    } else if (layer.childs.length > 1) {
      var leftChildLayer = layer.childs[0];
      var leftShift = leftChildLayer.nodeLeft;
      var rightChildLayer = layer.childs[childNodes.length - 1];
      var rightShift = rightChildLayer.width - rightChildLayer.nodeLeft - this.nodeWidth;
      var shift = (leftShift - rightShift) / 2;
      layer.nodeLeft = layer.width / 2 - this.nodeWidth / 2 + shift;
    }
  };

  this.renderLayerRecursive = function (layer, parentSelector) {
    var layerDiv = layer.createDiv();
    var nodeDiv = layer.node.createDiv(layer.nodeLeft);
    nodeDiv.appendTo(layerDiv);
    if (layer.childs.length > 0) {
      if (layer.node.stateType != 'hidden') {
        this.createArrowCanvas(layer).appendTo(layerDiv);
      }
      for (var i = 0; i < layer.childs.length; i++) {
        this.renderLayerRecursive(layer.childs[i], layerDiv);
      }
    }
    layerDiv.appendTo(parentSelector);
  };

  this.createClearDiv = function () {
    return $('<div>', {'class': 'clear'});
  };

  this.createArrowCanvas = function (layer) {
    var arrows = new Arrows(this.params.treeId + '_' + this.arrows.length);
    arrows.bindLayer(layer);
    this.arrows.push(arrows);
    return arrows.createCanvas();
  };

  this.drawArrows = function () {
    for (var i = 0; i < this.arrows.length; i++) {
      this.arrows[i].draw();
    }
  };

  this.appendTo = function (element) {
    if (typeof(element) == 'string') element = $(element);
    var block = $('<div>', {id: this.id});
    if (this.css) {
      block.css(this.css);
    }
    block.appendTo(element);
    this.render(block);
  };



  this.configDragAndDrop = function () {
    $('.node-comment').draggable({
      handle: '.node-comment',
      stop: function (event, ui) {
        var moveNodeCommentHtmlId = ui.helper.children()[0].id;
        var arr = moveNodeCommentHtmlId.split('_');
        var moveNodeCommentRealId = arr[arr.length - 1];
        var data = {
          id: moveNodeCommentRealId,
          x: ui.position.left,
          y: ui.position.top
        };
        if (!readonly) {
          a('sync').request('/api/node_comment/move', data);
        }
        dragSuccess = true;
      }
    });
    if (!readonly) {// && m('tree').hasEditAccess()) {
      var self = this;
      $('.node-comment').resizable({
        stop: function (event, ui) {
          var resizeNodeCommentHtmlId = ui.element.children()[0].id;
          var arr = resizeNodeCommentHtmlId.split('_');
          var resizeNodeCommentRealId = arr[arr.length - 1];
          var data = {
            id: resizeNodeCommentRealId,
            sx: ui.size.width,
            sy: ui.size.height
          };
          a('sync').request('/api/node_comment/resize', data);
          dragSuccess = true;
        }
      }).css('position', 'absolute');

      $('.drag-layer').draggable({
        handle: '.drag-node',
        cancel: '.node-comment',
        revert: "invalid",
        zIndex: 50
      });
      $('.empty-box').droppable({
        accept: '.drag-layer',
        activeClass: "empty-box-drop-active",
        hoverClass: "empty-box-drop-hover",
        greedy: false,
        tolerance: "pointer",
        drop: function (event, ui) {
          dragSuccess = true;

          var dragNodeHtmlId = ui.draggable.children()[0].id;
          var arr = dragNodeHtmlId.split('_');
          var dragTreeId = arr[arr.length - 2];
          var dragNodeRealId = arr[arr.length - 1];

          var dropNodeHtmlId = $(this).parent()[0].id;
          var arr = dropNodeHtmlId.split('_');
          var dropTreeId = arr[arr.length - 3];
          var dropNodeRealId = arr[arr.length - 2] + '_' + arr[arr.length - 1];

          $(this).removeClass('empty-box');
          $(this).html('');

          var data = {
            dragNodeId: dragNodeRealId,
            dropNodeId: dropNodeRealId,
            dropTreeId: dropTreeId
          };
          a('sync').request('/api/node/drop', data, function (getResult) {
            self.dragSuccess(dragTreeId, dropTreeId);
          });
        }
      });
    }
  }

  this.dragSuccess = function (dragTreeId, dropTreeId) {
    if (dragTreeId == m('tree').selId && dropTreeId == m('tree').selId) {
      // черновики не используется, перемещение в рамках дерева
      m('node' + m('tree').selId).reload(function () {
        b('tree' + m('tree').selId).updateHtml();
      });
    } else {
      var newDraftsCallback = cb(this, function () {
        // появились новые черновики, все черновики обновятся автоматически
        // если dragTreeId или dropTreeId является схемой - обновим её
        if (dragTreeId == m('tree').selId) {
          m('node' + dragTreeId).reload(function () {
            b('tree' + dragTreeId).updateHtml();
          });
        } else if (dropTreeId == m('tree').selId) {
          m('node' + dropTreeId).reload(function () {
            b('tree' + dropTreeId).updateHtml();
          });
        }
      });
      var notNewDraftsCallback = cb(this, function () {
        // новые черновики не появлялись - просто обновим схемы dragTreeId и dropTreeId
        m('node' + dragTreeId).reload(function () {
          b('tree' + dragTreeId).updateHtml();
        });
        if (dragTreeId != dropTreeId) {
          m('node' + dropTreeId).reload(function () {
            b('tree' + dropTreeId).updateHtml();
          });
        }
      });
      this.checkDrafts(newDraftsCallback, notNewDraftsCallback);
    }
  }
}