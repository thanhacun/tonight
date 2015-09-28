/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');
var User = require('../user/user.model');
var yelp = require ('yelp').createClient({
  consumer_key: 'nLi7Dv_CyoqcJrz7jyf4Kg',
  consumer_secret: 'GzTB0bJ1uLSZ0ZXjocprdWvzpsI',
  token: 'lLEvAD4SeUK1iyt0pNihhsOzSxDmsr9M',
  token_secret: 'FCzaYKhNuTjLu7D-V8N1Vb6l7-I'
});

//Get list of things in bars in Boston
exports.index = function(req, res){
  var locationName = req.params.location;
  if (!locationName) {
    return;
  }
  yelp.search({term: 'bar', location: locationName}, function(err, data) {
    if (err) {return handleError(res, err)};
    //filter not closed businesses
    data.businesses = data.businesses.filter(function(biz){
      //not closed biz
      return !biz.is_closed;
    });
    Thing.find(function (err, things){
      data.bars = things;
      return res.status(200).json(data);
    })
    //attach baz data
    //console.log(JSON.stringify(data));

  })
};

// Get list of things
exports.index_no_use = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Thing.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(thing);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
