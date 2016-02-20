'use strict';

var _ = require('lodash');

function RedirectsSvc(app) {
    this.app = app;
}

RedirectsSvc.prototype.newRedirect = function (urlFrom, urlTo, site, next) {
    var url = site.isHttps ? 'https' : 'http';
    url += '://' + site.domain;
    if (site.port && site.port != 80) {
        url += ':' + site.port;
    }

    if (urlFrom == urlTo) {
        return next();
    }
    var app = this.app,
        item = new app.models.redirects({
        urlFrom: url + urlFrom,
        urlTo: url + urlTo,
        code: 301,
        site: { _id: site._id }
    });
    item.save(function() {
        app.models.redirects.update({ urlTo: url + urlFrom }, { $set: { urlTo: url + urlTo } }, { multi: true }, next);
    });
};


module.exports = RedirectsSvc;
