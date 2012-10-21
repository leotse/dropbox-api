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


// helper to check for errors in an api call
// if there are any errors, respond with standard error page
helpers.hasErrors = function(res, e, r) {

	if(e) helpers.sendError(res, e);
	else if(r.statusCode !== 200) helpers.sendError(res, new Error('status code: ' + r.statusCode));
	else return false;
	return true;

};


// helper to send an error
helpers.sendError = function(res, err) {

	res.send('there is a problem... ' + err);

};


// export
module.exports = helpers;