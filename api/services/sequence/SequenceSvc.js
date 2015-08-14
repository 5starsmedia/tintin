'use strict';

function SequenceSvc(app) {
  this.app = app;
}

SequenceSvc.prototype.getNext = function (name, next) {
  var self = this;
  self.app.models.sequences.findOneAndUpdate(
    {name: name},
    {$inc: {value: 1}, $set: {modifyDate: Date.now()}},
    {upsert: true},
    function (err, counter) {
      if (err) { return next(err); }
      if (!counter) { return next(null, 1); }
      next(null, counter.value);
    });
};

module.exports = SequenceSvc;
