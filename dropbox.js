/////////////////////////
// Dropbox API Wrapper //
/////////////////////////

// dependencies 
var util = require('util')
,	request = require('request')
,	qs = require('querystring')
,	config = require('./config').dropbox
,	helpers = require('./helpers');

// namespace
var dropbox = {};


// api endpoints
var BASE_URL = "https://api.dropbox.com/1";

// auth endpoints
var REQUEST_TOKEN_URL = BASE_URL + '/oauth/request_token'
,	AUTHORIZE_URL = BASE_URL + '/oauth/authorize?oauth_token=%s&oauth_callback=%s'
,	ACCESS_TOKEN_URL = BASE_URL + '/oauth/access_token';

// account endpoints
var ACCOUNT_INFO_URL = BASE_URL + '/account/info';

// file and metadata endpoints
// file operations endpoints


// authoriezes the user against dropbox
// requires session to be enabled because that is where the temporary request token secret  is stored
dropbox.authorize = function(req, res) {
	var url = REQUEST_TOKEN_URL
	,	oauth = {
			consumer_key: config.key,
			consumer_secret: config.secret
		};

	request.post({ url: url, oauth: oauth }, function(e, r, body) {
		if(!helpers.hasErrors(res, e, r, body)) {

			// got request token
			var params = qs.parse(body)
			,	token = params.oauth_token
			,	secret = params.oauth_token_secret;

			// store the secret in session for now
			// will be used in the oauth callback
			req.session.secret = secret;

			// redirect user to dropbox oauth page
			var url = util.format(AUTHORIZE_URL, token, config.callback);
			res.redirect(url);
		}
	});
};

dropbox.getToken = function(req, callback) {

	// make sure user was logged in
	var session = req.session;
	if(!session || !session.secret) {
		callback(new Error('user is not logged in!'));
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

		var errors = helpers.getErrors(e, r, body);
		if(errors) callback(errors);
		else {

			// we should have the access token and secret woo!
			var params = qs.parse(body)
			,	uid = params.uid
			,	token = params.oauth_token
			,	secret = params.oauth_token_secret;

			callback(null, {
				uid: uid,
				token: token,
				secret: secret
			});
		}
	});
};


// retrieves account info of the currently logged in user
// expects a token object that contains the user's oauth token and oauth secret
// ex: { token: 'i-am-a-token', secret: 'i-am-the-token-secret' }
dropbox.accountInfo = function(token, callback) {

	var url = ACCOUNT_INFO_URL;
	get(url, token, function(err, info) {
		if(err) callback(err);
		else callback(null, info);
	});
};


// export
module.exports = dropbox;



/////////////
// Helpers //
/////////////

// simple helper to make a oauth get request
// assumes token object of format: { token: 'iamatoken', secret: 'iamthetokensecret'}
function get(url, token, callback) {

	var oauth = {
			consumer_key: config.key,
			consumer_secret: config.secret,
			token: token.token,
			token_secret: token.secret
		};

	request.get({ url: url, oauth: oauth }, function(err, res, body) {
		var errors = helpers.getErrors(err, res, body);
		if(errors) callback(errors);
		else {

			try {
				var json = JSON.parse(body);
				callback(null, json);
			} catch(ex) {
				callback(new Error('error parsing response: ' + ex));
			}
		}
	});
}
