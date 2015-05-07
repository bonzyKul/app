'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Release = mongoose.model('Release'),
	_ = require('lodash');

/**
 * Create a Release
 */
exports.create = function(req, res) {
	var release = new Release(req.body);
	release.user = req.user;

	release.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(release);
		}
	});
};

/**
 * Show the current Release
 */
exports.read = function(req, res) {
	res.jsonp(req.release);
};

/**
 * Update a Release
 */
exports.update = function(req, res) {
	var release = req.release ;

	release = _.extend(release , req.body);

	release.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(release);
		}
	});
};

/**
 * Delete an Release
 */
exports.delete = function(req, res) {
	var release = req.release ;

	release.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(release);
		}
	});
};

/**
 * List of Releases
 */
exports.list = function(req, res) { 
	Release.find().sort('-created').populate('user', 'displayName').exec(function(err, releases) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(releases);
		}
	});
};

/**
 * Release middleware
 */
exports.releaseByID = function(req, res, next, id) { 
	Release.findById(id).populate('user', 'displayName').exec(function(err, release) {
		if (err) return next(err);
		if (! release) return next(new Error('Failed to load Release ' + id));
		req.release = release ;
		next();
	});
};

/**
 * Release authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.release.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
