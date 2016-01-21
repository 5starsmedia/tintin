/**
 * @copyright 2014 Cannasos.com. All rights reserved.
 */
'use strict';

var htmlparser2 = require('htmlparser2');

function HtmlSvc() {
  this.allowedTags = {
    h1: 1,
    h2: 1,
    h3: 1,
    p: 1,
    img: {src: 1},
    a: {href: 1},
    ul: 1,
    ol: 1,
    li: 1,
    blockquote: 1,
    b: 1,
    i: 1,
    strong: 1,
    em: 1,
    table: 1,
    tr: 1,
    td: 1,
    th: 1,
    tbody,
    thead,
    tfoot,
    iframe: {src: 1, width: 1, height: 1, frameborder: 1, allowfullscreen: 1}
  };

  this.replaceTags = {
    b: 'strong',
    i: 'em'
  };

  this.selfClosingTags = {br: 1};
}

HtmlSvc.prototype.clearHtml = function (text, next) {
  var self = this;
  var result = '';
  var indent = 0;
  var isSelfClosing = false;

  var parser = new htmlparser2.Parser({
    onopentag: function (name, attribs) {
      var allowedTag = self.allowedTags[name.toLowerCase()];
      if (!allowedTag) {return;}
      var attrs = [];

      isSelfClosing = self.selfClosingTags[name.toLowerCase()];
      for (var aName in attribs) {
        if (attribs.hasOwnProperty(aName) && allowedTag[aName.toLowerCase()]) {
          var aValue = attribs[aName];
          attrs.push(aName + '=\"' + aValue + '\"');
        }
      }
      if (name === 'a') {
        var href = attribs.href;
        if (href && href.indexOf('https://cannasos.com') === -1) {
          attrs.push('target=\"_blank\"');
        }
        attrs.push('rel=\"nofollow\"');
      }
      result += '<' + (self.replaceTags[name] || name) + (attrs.length > 0 ? ' ' + attrs.join(' ') : '');
      if (isSelfClosing) {
        result += ' />';
      } else {
        result += '>';
        indent += 1;
      }
    },
    ontext: function (text) {
      if (!isSelfClosing && text && text.trim().length > 0) {
        if (indent === 0) {
          result += '<p>' + text + '</p>';
        } else {
          result += text;
        }
      }
    },
    onclosetag: function (name) {
      if (!self.allowedTags[name.toLowerCase()]) {return;}
      if (self.selfClosingTags[name.toLowerCase()]) {
        isSelfClosing = false;
      } else {
        result += '</' + (self.replaceTags[name] || name) + '>';
        indent -= 1;
      }
    }
  }, {
    recognizeSelfClosing: true,
    decodeEntities: true
  });
  parser.write(text);
  parser.end();
  setImmediate(function () {
    next(null, result);
  });
};

module.exports = HtmlSvc;
