///////////////////////////
// Authentication Routes //
///////////////////////////

// dependencies
var request = require('request')
,	qs = require('querystring')
,	util = require('util')
,	helpers = require('../helpers')
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
		res.send('already logged in');
		return;
	}

	var url = 'https://api.dropbox.com/1/oauth/request_token'
	,	oauth = {
			consumer_key: config.key,
			consumer_secret: config.secret
		};

	request.post({ url: url, oauth: oauth }, function(e, r, body) {
		if(!helpers.hasErrors(res, e, r)) {

			// got request token
			var params = qs.parse(body)
			,	token = params.oauth_token
			,	secret = params.oauth_token_secret;

			// store the secret in session for now
			// will be used in the oauth callback
			req.session.secret = secret;

			// redirect user to dropbox oauth page
			var url = util.format('https://api.dropbox.com/1/oauth/authorize?oauth_token=%s&oauth_callback=%s', token, config.callback);
			res.redirect(url);
		}
	});
};


/////////////////////////
// GET /login/callback //
/////////////////////////

// user has authorized the app!
// exchange the request token with an access token
auth.callback = function(req, res) {

	// make sure user was logged in
	var session = req.session;
	if(!session || !session.secret) {
		helpers.sendError(res, new Error('user not logged in!'));
		return;
	}

	// parse the response
	var query = req.query
	,	uid = query.uid
	,	token = query.oauth_token
	,	secret = session.secret;
	
	var url = 'https://api.dropbox.com/1/oauth/access_token'
	,	oauth = {
			consumer_key: config.key,
			consumer_secret: config.secret,
			token: token,
			token_secret: secret
		};

	request.post({ url: url, oauth: oauth }, function(e, r, body) {

		if(!helpers.hasErrors(res, e, r)) {

			// we should have the access token and secret woo!
			var params = qs.parse(body)
			,	uid = params.uid
			,	token = params.oauth_token
			,	secret = params.oauth_token_secret;

			// store the token in session for now
			req.session.uid = uid;
			req.session.token = token;
			req.session.secret = secret;

			// authentiaction completed!
			// test out a call
			var url = 'https://api.dropbox.com/1/account/info'
			,	oauth = {
					consumer_key: config.key,
					consumer_secret: config.secret,
					token: token,
					token_secret: secret
				};
			request.get({ url: url, oauth: oauth }, function(e, r, body) {
				if(!helpers.hasErrors(res, e, r)) {

					// show the respond to user
					res.send(body);
				}
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