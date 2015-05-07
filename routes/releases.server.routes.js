'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var releases = require('../../app/controllers/releases.server.controller');

	// Releases Routes
	app.route('/releases')
		.get(releases.list)
		.post(users.requiresLogin, releases.create);

	app.route('/releases/:releaseId')
		.get(releases.read)
		.put(users.requiresLogin, releases.hasAuthorization, releases.update)
		.delete(users.requiresLogin, releases.hasAuthorization, releases.delete);

	// Finish by binding the Release middleware
	app.param('releaseId', releases.releaseByID);
};
