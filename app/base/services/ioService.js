/*@ngInject*/
function IOSvc($log, $q, $auth, IO_URL) {
  this.$log = $log;
  this.$q = $q;
  this.$auth = $auth;
  this.IO_URL = IO_URL;
  this.ioInstance = null;
}

IOSvc.prototype.connect = function () {
  var auth = this.$auth.getToken();
  if (auth) {
    this.$log.debug('[ioService]', 'Connecting to socket');
    this.ioInstance = window.io.connect(this.IO_URL, {query: {token: auth}});
  }
};

IOSvc.prototype.on = function (eventName, fn) {
  if (this.ioInstance) {
    this.ioInstance.on(eventName, fn);
  }
  return {eventName: eventName, fn: fn};
};

IOSvc.prototype.off = function (eventName, fn) {
  if (this.ioInstance && this.ioInstance.off) {
    if (typeof fn === 'undefined' && typeof eventName.fn === 'function') {
      this.ioInstance.off(eventName.eventName, eventName.fn);
    } else {
      this.ioInstance.off(eventName, fn);
    }
  }
};

IOSvc.prototype.getSocket = function () {
  return this.ioInstance;
};

export default IOSvc;