'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Release = mongoose.model('Release'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, release;

/**
 * Release routes tests
 */
describe('Release CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Release
		user.save(function() {
			release = {
				name: 'Release Name'
			};

			done();
		});
	});

	it('should be able to save Release instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Release
				agent.post('/releases')
					.send(release)
					.expect(200)
					.end(function(releaseSaveErr, releaseSaveRes) {
						// Handle Release save error
						if (releaseSaveErr) done(releaseSaveErr);

						// Get a list of Releases
						agent.get('/releases')
							.end(function(releasesGetErr, releasesGetRes) {
								// Handle Release save error
								if (releasesGetErr) done(releasesGetErr);

								// Get Releases list
								var releases = releasesGetRes.body;

								// Set assertions
								(releases[0].user._id).should.equal(userId);
								(releases[0].name).should.match('Release Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Release instance if not logged in', function(done) {
		agent.post('/releases')
			.send(release)
			.expect(401)
			.end(function(releaseSaveErr, releaseSaveRes) {
				// Call the assertion callback
				done(releaseSaveErr);
			});
	});

	it('should not be able to save Release instance if no name is provided', function(done) {
		// Invalidate name field
		release.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Release
				agent.post('/releases')
					.send(release)
					.expect(400)
					.end(function(releaseSaveErr, releaseSaveRes) {
						// Set message assertion
						(releaseSaveRes.body.message).should.match('Please fill Release name');
						
						// Handle Release save error
						done(releaseSaveErr);
					});
			});
	});

	it('should be able to update Release instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Release
				agent.post('/releases')
					.send(release)
					.expect(200)
					.end(function(releaseSaveErr, releaseSaveRes) {
						// Handle Release save error
						if (releaseSaveErr) done(releaseSaveErr);

						// Update Release name
						release.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Release
						agent.put('/releases/' + releaseSaveRes.body._id)
							.send(release)
							.expect(200)
							.end(function(releaseUpdateErr, releaseUpdateRes) {
								// Handle Release update error
								if (releaseUpdateErr) done(releaseUpdateErr);

								// Set assertions
								(releaseUpdateRes.body._id).should.equal(releaseSaveRes.body._id);
								(releaseUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Releases if not signed in', function(done) {
		// Create new Release model instance
		var releaseObj = new Release(release);

		// Save the Release
		releaseObj.save(function() {
			// Request Releases
			request(app).get('/releases')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Release if not signed in', function(done) {
		// Create new Release model instance
		var releaseObj = new Release(release);

		// Save the Release
		releaseObj.save(function() {
			request(app).get('/releases/' + releaseObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', release.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Release instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Release
				agent.post('/releases')
					.send(release)
					.expect(200)
					.end(function(releaseSaveErr, releaseSaveRes) {
						// Handle Release save error
						if (releaseSaveErr) done(releaseSaveErr);

						// Delete existing Release
						agent.delete('/releases/' + releaseSaveRes.body._id)
							.send(release)
							.expect(200)
							.end(function(releaseDeleteErr, releaseDeleteRes) {
								// Handle Release error error
								if (releaseDeleteErr) done(releaseDeleteErr);

								// Set assertions
								(releaseDeleteRes.body._id).should.equal(releaseSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Release instance if not signed in', function(done) {
		// Set Release user 
		release.user = user;

		// Create new Release model instance
		var releaseObj = new Release(release);

		// Save the Release
		releaseObj.save(function() {
			// Try deleting Release
			request(app).delete('/releases/' + releaseObj._id)
			.expect(401)
			.end(function(releaseDeleteErr, releaseDeleteRes) {
				// Set message assertion
				(releaseDeleteRes.body.message).should.match('User is not logged in');

				// Handle Release error error
				done(releaseDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Release.remove().exec();
		done();
	});
});