function EventEmitterBase($log) {
  this.watchers = {};
  this.$log = $log;
}

EventEmitterBase.prototype.on = function (eventName, handler, debugName) {
  this.watchers[eventName] = this.watchers[eventName] || [];
  this.$log.debug('[EventSvc]', debugName, 'subscribe to event', eventName);
  this.watchers[eventName].push({handler: handler, debugName: debugName});
};

EventEmitterBase.prototype.off = function (eventName, handler) {
  if (!this.watchers[eventName]) { return; }
  var watcher = _.find(this.watchers[eventName], {handler: handler});
  if (!watcher) { return; }
  this.$log.debug('[EventSvc]', watcher.debugName, 'unsubscribe from event', eventName);
  _.remove(this.listWatchers, {handler: handler});
};

EventEmitterBase.prototype.emit = function (eventName, arg) {
  if (!this.watchers[eventName]) { return; }
  _.each(this.watchers[eventName], function (watcher) {
    if (_.isFunction(watcher.handler)) {
      watcher.handler(arg);
    }
  });
};

function BaseEventService() { }

BaseEventService.prototype.EventEmitterBase = EventEmitterBase;

export default BaseEventService;