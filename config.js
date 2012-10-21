////////////////////
// Configurations //
////////////////////


// redistogo connection
var redis = {};
redis.connectionString = 'redis://redistogo:e591b65b1c5ecea70a4ba696453ff6de@sole.redistogo.com:9096';
redis.host = 'sole.redistogo.com';
redis.port = 9096;
redis.pass = 'e591b65b1c5ecea70a4ba696453ff6de';
module.exports.redis = redis;


// dropbox api
var dropbox = {};
dropbox.key = '40dydoeep46g288';
dropbox.secret = 'umlbt135e3wvs7c';
dropbox.callback = 'http://localhost:3000/login/callback';
module.exports.dropbox = dropbox;