////////////////////
// Common Helpers //
////////////////////

// namespace 
var helpers = {};


// check if the user is logged in
helpers.isLoggedIn = function(req) {

	var session = req.session;
	if(session && session.uid && session.token && session.secret) {
		return true;
	}
	return false;
};


// gets a token object expected by the dropbox api wrapper for oauth signing
helpers.getToken = function(req) {
	if(!helpers.isLoggedIn(req)) return null;
	else {

		var session = req.session
		,	token = {
				token: session.token,
				secret: session.secret
			};
		return token;
	}
}


// helper to check for errors in an api call
// if there are any errors, respond with standard error page
helpers.hasErrors = function(res, e, r, body) {

	var errors = helpers.getErrors(e, r, body);
	if(errors) {
		helpers.sendError(res, errors);
		return true;
	} 
	return false;
};


// helper to get a standardized error from an api call
helpers.getErrors = function(err, res, body) {
	if(err) return err;
	else if(res.statusCode !== 200) return new Error('status code:' + res.statusCode + ' message: ' + body);
	else return null;
};


// helper to send an error
helpers.sendError = function(res, err) {

	res.send('there is a problem... ' + err);

};


// export
module.exports = helpers;