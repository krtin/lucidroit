var createError = require('http-errors');
var http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

const hostname = 'localhost';
const port = 3000;
const mongoose = require('mongoose');






const url = config.mongoUrl;
const connect = mongoose.connect(url, {autoIndex: true, useNewUrlParser: true});


connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });


//Routes
const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promotionRouter = require('./routes/promotionRouter');
const userRouter = require('./routes/userRouter');
const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/uploadRouter');





var app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

//app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join("../../frontend", 'angular')));




app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promotionRouter);
app.use('/imageUpload',uploadRouter);

//app.use('/', index);

app.use((req, res, next) => {
  console.log(req.headers);
  res.statusCode = 404;
  fileUrl = req.url;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>Error 404: ' + fileUrl +
              ' not Found</h1></body></html>');

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
