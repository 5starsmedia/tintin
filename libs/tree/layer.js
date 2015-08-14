function Layer(node, parent) {
  this.width = 150;
  this.nodeLeft = 0;
  this.node = node;
  this.childs = [];
  this.parent = parent;

  this.createDiv = function () {
    var layerDiv = $('<div>', {
      'class': 'layer',
      width: this.width
    });
    var draggable = this.node.draggable;
    if (draggable === undefined || draggable != false) {
      layerDiv.addClass('drag-layer');
    }
    return layerDiv;
  }
}