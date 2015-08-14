function Arrows(id) {
  this.id = id;
  this.stateType = null;
  this.width = null;
  this.left = null;
  this.height = 50;
  this.points = [];
  this.childsNodes = []; // nodes for pluses
  this.context = null;
  this.plusIconWidth = 18;
  this.plusIconHeight = 18;
  this.nodeWidth = 150;

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

  this.bindLayer = function (layer) {
    this.stateType = layer.node.stateType;
    this.width = layer.width;
    this.left = layer.nodeLeft;
    var shift = 0;
    for (var i = 0; i < layer.childs.length; i++) {
      var childWidth = layer.childs[i].width;
      this.points.push(shift + layer.childs[i].nodeLeft + this.nodeWidth / 2);
      this.childsNodes.push(layer.childs[i].node.stateType == 'empty' ? false : layer.childs[i].node);
      shift += childWidth;
    }
    var arrowsDistance = this.points[this.points.length - 1] - this.points[0];
    if (layer.childs.length == 1 && layer.childs[0].node.caption == '') {
      this.height = 40;
    } else if (arrowsDistance > 500) {
      this.height = arrowsDistance / 8;
    }
  }

  this.createCanvas = function () {
    var canvasDiv = $('<div>', {
      id: 'arrows_' + this.id
    }).css('height', this.height);

    var plusesDiv = $('<div>', {
      id: 'arrows_pluses_' + this.id
    }).css({
      'position': 'relative'
    }).appendTo(canvasDiv);

    $('<canvas>', {
      id: 'arrows_canvas_' + this.id,
      width: this.width,
      height: this.height
    }).appendTo(canvasDiv);
    return canvasDiv;
  }

  this.draw = function () {
    var canvas = $('#arrows_canvas_' + this.id)[0];
    if (canvas) {
      canvas.width = this.width;
      canvas.height = this.height;
      if (canvas.getContext) {
        this.context = canvas.getContext('2d');
        for (var i = 0; i < this.points.length; i++) {
          this.drawArrow(this.left + this.nodeWidth / 2, 0, this.points[i], this.height, this.stateType, i);
        }
      }

      for (var i = 0; i < this.childsNodes.length; i++) {
        if (this.childsNodes[i]) {
          this.drawPlus(i);
        }
      }
    }
  };

  this.drawArrow = function (fromx, fromy, tox, toy, type, num) {
    this.context.beginPath();
    this.context.moveTo(fromx, fromy);
    this.context.bezierCurveTo(fromx, (toy - fromy) / 2, tox, (toy - fromy) / 2, tox, toy);
    this.context.lineWidth = 2;
    this.context.strokeStyle = this.getColor(type, num);
    this.context.stroke();
  };

  this.getColor = function (type, num) {
    if (type == 'VSC' || type == 'VSE' || type == 'CI') {
      return '#eac931';
    } else if (type.substring(0, 3) == 'if.') {
      if (num == 0) {
        return '#6cbe35';
      } else if (num == 1) {
        return '#e8573a';
      }
    } else if (type == 'check_direction') {
      return '#e8573a';
    }
    return '#2B99D2';
  }

  this.drawPlus = function (i) {

    var height = this.height, self = this;
    if (this.points[i] != this.left + this.nodeWidth / 2) {
      var left = Math.min(this.points[i], this.left + this.nodeWidth / 2);
      var width = Math.abs(this.left + this.nodeWidth / 2 - this.points[i]);
      //l({'points':this.points[i], 'this.left':this.left, 'left':left,'width':width});
    } else {
      var left = this.left + this.nodeWidth / 2;
      var width = 0;
    }
    var plusDiv = $('<div>', {
      'class': 'plus-wrapper'
    }).css({
      'margin-left': left + 'px',
      'width': width + 'px',
      'height': height + 'px',
      'line-height': height + 'px'
    });
    var image = $('<img>', {src: 'assets/images/tree/empty.png', 'class': 'plus-image', 'title': 'Добавить в план'})
      .css({
        'position': 'absolute',
        'left': left + (width / 2) - (this.plusIconWidth / 2),
        'top': (height / 2) - (this.plusIconHeight / 2)
      })
      .on('click', function () {
        var node = self.childsNodes[i];

        node.tree.onNodeInsert(node);
      });

    image.prependTo('#arrows_pluses_' + this.id);
  }
}