import {} from './filter.js';
import {} from './indexOf.js';

if (!Array.prototype.diff) {
  Array.prototype.diff = function (a) {
    return this.filter(function (i) {
      return !(a.indexOf(i) > -1);
    });
  };
}