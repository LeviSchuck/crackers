//Welcome to crackers.
var restify = require('restify'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	passport = require('passport'),
    util = require('util'),
    BrowserIDStrategy = require('passport-browserid').Strategy,
    clientSessions = require("client-sessions"),
    crypto = require('crypto');
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
    email: String,
    happy: Boolean,
    type: String,
    hash: String
});
var postSchema = mongoose.Schema({
	email: String,
	hash: String,
	contents: String,
	posted: Date
});
var Limit = 100;
var User = mongoose.model('User', userSchema);
var Post = mongoose.model('Post',postSchema);
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
    cookieName: 'session',
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
function ensureAdmin(req, res, next) {
  User.findOne({email: req.user.email},function(err,user){
  	if(user){
  		if(user.type == 'admin'){
  			return next();
  		}
  		return false;
  	}
  	return false;
  });
}
//var b = new User({email: "taco@happymail.com", happy: false, type: "user"});
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
   User.findOne({_id: req.params.userid},function(err,user){
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
	   				user._id = req.body._id;
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


server.put('/posts',ensureAuthenticated,function(req,res,next){
	try{
		if(req.body.contents.length > Limit)
			throw "cookies";
	}catch(ex){
		res.send(400,new restify.InvalidContentError("Contents too long"));
		return next();
	}
	
	
	var p = new Post();
	var md5sum = crypto.createHash('md5');
	p.contents = req.body.contents;
	p.email = req.user.email;
	md5sum.update(p.email);
	p.hash = md5sum.digest('hex');
	p.posted = new Date();
	p.save();
	res.send(201,p);
	return next();
});
server.get('/posts',function(req,res,next){
	Post.find(function (err, posts) {
		if(posts){
			res.send(200,posts);
		}
		else
		{
			res.send(200, []);
		}
		return next();
	});
});
server.get('/limit',function(req,res,next){
	res.send(200,{limit: Limit});
	return next();
});
server.post('/limit',ensureAuthenticated,ensureAdmin,function(req,res,next){
	Limit = req.body.limit;
	res.send(201,{limit: Limit});
	return next();
});
function persona_authenticated(req, res, next){
	var md5sum = crypto.createHash('md5');
	req.session.lastAuth = new Date();
	if(req.isAuthenticated()){
		User.findOne({email: req.user.email},function(err,user){
	   		if(user){
				res.send(200,{authenticated: true, user: user});
			}else{
				//signup!
				md5sum.update(req.user.email);
				var b = new User({email: req.user.email, happy: false, type: "user", hash: md5sum.digest('hex')});
				b.save();
				
				res.send(200,{authenticated: true, user: {
					email: b.email,
					happy: b.happy,
					type: b.type,
					hash: b.hash
				}});
			}
			return next();

		});
	}else{
		res.send(200,{authenticated: false});
		return next();
	}
	
	
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