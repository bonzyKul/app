'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Release Schema
 */
var ReleaseSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Release name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Release', ReleaseSchema);