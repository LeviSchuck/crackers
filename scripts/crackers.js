//Welcome to crackers.
var restify = require('restify'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	passport = require('passport'),
    util = require('util'),
    BrowserIDStrategy = require('passport-browserid').Strategy,
    clientSessions = require("client-sessions");
//--------------------
mongoose.connect('mongodb://localhost/crackers');

var server = restify.createServer({
  name: 'Crackers',
});
server.use(restify.bodyParser({ mapParams: false }));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});
var userSchema = mongoose.Schema({
    name: String,
    image: String,
    email: String,
    happy: Boolean
});
var User = mongoose.model('User', userSchema);

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  done(null, { email: email });
});
passport.use(new BrowserIDStrategy({
    audience: 'http://localhost:8000'
  },
  function(email, done) {
      return done(null, { email: email });
  }
));
server.use(clientSessions({
    cookieName: 'session_state',
    secret: 'super special thing that means absolutely nothing', 
    duration: 24 * 60 * 60 * 1000*42,
  }));
server.use(passport.initialize());
server.use(passport.session());
function ensureAuthenticated(req, res, next) {
  if (req.user) { return next(); }
  res.send(401, new restify.NotAuthorizedError());
  return false;
}
//var b = new User({name: "Levi", email: "levi.schuck@gmail.com", happy: true});
//b.save();
//Begin API




server.get('/users', function(req, res, next){
	User.find(function (err, users) {
	  if(users){
	  	res.send(200,users);
	  }
	  else
	  {
	  	res.send(200, []);
	  }
	  return next();
	});
});
server.get('/users/:userid', function(req, res, next){
   User.find({_id: req.params.userid},function(err,user){
   	if(user)
		res.send(200, user);
   	else
   		res.send(404, new restify.ResourceNotFoundError("No such user"));
   });
   
   return next();
});

server.post('/users/:userid',ensureAuthenticated,function(req, res, next){
	User.findOne({_id: req.params.userid},function(err,user){
   	if(user){
   		var user = _.omit(req.body,'_id');
   		User.update({_id: req.params.userid}, user,function(err,a,raw){
   			if(err){
   				res.send(400,new restify.InvalidContentError(raw));
   			}else{
   				res.send(201,user);
   			}
   			return next();
   		});
   	}else{
   		res.send(404, new restify.ResourceNotFoundError("No such user"));
   		return next();
   	}
   		

   });
});
server.put('/users',function(req, res, next){
	var user = new User(res.body);
	user.save();
	res.send(201,user);
});
function persona_authenticated(req, res, next){
	if(req.isAuthenticated()){
		res.send(200,{authenticated: true, user: req.user});
	}else{
		res.send(200,{authenticated: false});
	}
	
	return next();
};
function persona_logout(req, res, next){
	req.session.reset();
	req.logout();
	res.send(200);
	return next();
};
server.get('/auth',persona_authenticated);
server.post('/auth', passport.authenticate('browserid'), persona_authenticated);
server.del('/auth', persona_logout);




//Static files here
server.get(/.*/, restify.serveStatic({
  directory: './app',
  default: 'index.html'
}));




server.listen(8000);