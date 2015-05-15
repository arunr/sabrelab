'use strict';
var SabreDevStudio = require('sabre-dev-studio');
var sabreDevStudio = new SabreDevStudio({
  client_id:     'V1:2wsxopvowhfw47bw:DEVCENTER:EXT',
  client_secret: '0h8kNNHa',
  uri:           'https://api.test.sabre.com'
});
var options = {};

module.exports = function(app) {
  app.get('/api/v1/themes', function(req,res) {
    sabreCall('/v1/lists/supported/shop/themes', res);
  });

  app.get('/api/v1/routes', function(req,res) {
    sabreCall('/v1/shop/flights/fares?origin=CLT&departuredate=2015-10-15&returndate=2015-10-25', res);
  });

  app.get('/api/v1/top', function(req,res) {
    sabreCall('/v1/lists/top/destinations?origin=NYC&lookbackweeks=8&topdestinations=5', res);
  });

  app.get('/api/v1/cities', function(req,res) {
    sabreCall('/v1/lists/supported/cities', res);
  });

  app.get('/api/v1/places', function(req,res) {
    sabreCall('/v1/shop/flights/fares?origin=' + req.query.origin +
    '&departuredate=' + req.query.departuredate +
    '&returndate=' + req.query.returndate +
    '&maxfare=' + req.query.maxfare, res);
  });

};

function sabreCall(q, res) {
  sabreDevStudio.get(q, options, function(err, data) {
    response(res, err, data);
  });
}

function response(res, err, data) {
  if (err) {
    res.status(200).send({
      'status': false,
      'message': 'Error',
      'info': err
    });
  } else {
    res.status(200).send({
      'status': true,
      'message': 'Success',
      'info': data
    });
  }
}
