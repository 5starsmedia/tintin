'use strict';

var _ = require('lodash');

function RedirectsSvc(app) {
    this.app = app;
    this.log = app.log.child({module: 'RedirectsSvc'});
}

RedirectsSvc.prototype.newRedirect = function (urlFrom, urlTo, site, next) {
    var url = site.isHttps ? 'https' : 'http';
    url += '://' + site.domain;
    if (site.port && site.port != 80) {
        url += ':' + site.port;
    }
    urlFrom = url + urlFrom;
    urlTo = url + urlTo;
    if (urlFrom == urlTo) {
        return next();
    }
    this.log.info('New redirect %s => %s', urlFrom, urlTo);
    var app = this.app,
        item = new app.models.redirects({
        urlFrom: urlFrom,
        urlTo: urlTo,
        code: 301,
        site: { _id: site._id }
    });
    item.save(function() {
        app.models.redirects.update({ urlTo: urlFrom }, { $set: { urlTo: urlTo } }, { multi: true }, next);
    });
};


module.exports = RedirectsSvc;
