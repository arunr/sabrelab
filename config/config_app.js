'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    errorhandler = require('errorhandler'),
    multer  = require('multer');


module.exports = function(app) {
  app.use(compression());
  app.use(morgan('dev'));
  app.use(bodyParser());
  app.use(multer());
  app.use(cookieParser('Twyst_2014_Sessions'));

  app.use(methodOverride());

  app.use(express.static(__dirname + '/../www/'));

  // app.use(favicon(__dirname + '/../../Twyst-Web-Apps/common/images/favicon/twyst.ico'));
  app.all("/api/*", function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Accept");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, HEAD, DELETE, OPTIONS");
      return next();
  });

  app.use(errorhandler({
      dumpExceptions: true,
      showStack: true
  }));

};
