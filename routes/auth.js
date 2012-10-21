///////////////////////////
// Authentication Routes //
///////////////////////////

// dependencies
var request = require('request')
,	qs = require('querystring')
,	util = require('util')
,	helpers = require('../helpers')
,	dropbox = require('../dropbox')
,	config = require('../config').dropbox;

// namespace
var auth = {}


////////////////
// GET /login //
////////////////

// first gets a request token
// then redirects the user to the dropbox login page
auth.login = function(req, res) {

	if(helpers.isLoggedIn(req)) {

		// test call to verify oauth tokens
		var token = helpers.getToken(req);
		dropbox.accountInfo(token, function(err, info) {
			if(err) helpers.sendError(res, err);
			else res.send(info);
		});
	} else {

		// continue with dropbox auth
		dropbox.authorize(req, res);
	}
};


/////////////////////////
// GET /login/callback //
/////////////////////////

// user has authorized the app!
// exchange the request token with an access token
auth.callback = function(req, res) {

	dropbox.getToken(req, function(err, token) {
		if(err) helpers.sendError(res, err);
		else {

			// put the tokens in session
			req.session.uid = token.uid;
			req.session.token = token.token;
			req.session.secret = token.secret;

			// test call to verify oauth tokens
			dropbox.accountInfo(token, function(err, info) {
				if(err) helpers.sendError(res, err);
				else res.send(info);
			});
		}
	});
};


// logs the user out
auth.logout = function(req, res) {

	if(req.session) {
		req.session.destroy();
	}
	res.send('logged out');
};


// export
module.exports = auth;