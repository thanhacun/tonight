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
var async = require('async');
var auth = require('../../auth/auth.service');

var Thing = require('./thing.model');
var User = require('../user/user.model');
var yelp = require ('yelp').createClient({
  consumer_key: 'nLi7Dv_CyoqcJrz7jyf4Kg',
  consumer_secret: 'GzTB0bJ1uLSZ0ZXjocprdWvzpsI',
  token: 'lLEvAD4SeUK1iyt0pNihhsOzSxDmsr9M',
  token_secret: 'FCzaYKhNuTjLu7D-V8N1Vb6l7-I'
});

exports.bars = function(req, res) {
  User.find()
    .populate('bars')
    .exec(function(err, users){
      return res.status(200).json(users);
    })
}

exports.users= function(req, res) {
  Thing.find()
    .populate('users', 'name email')
    .exec(function(err, things){
      return res.status(200).json(things);
  });
};

//Get list of things in bars location otherwise Boston
exports.index = function(req, res){
  var locationName = req.params.location;
  if (!locationName) { return;}
  yelp.search({term: 'bar', location: locationName}, function(err, data) {
    if (err) {return handleError(res, err)};
    //filter not closed businesses
    data.businesses = data.businesses.filter(function(biz){
      //not closed biz
      return !biz.is_closed;
    });
    async.map(data.businesses, function(biz, addUser){
      //attach users information to biz data
      Thing.findOne({bar_id: biz.id}, function(err, bar){
        if (err || !bar) {
          biz.users = [];
          return addUser(null, biz);
        } else {
          console.log(bar.users);
          biz.users = bar.users;
          return addUser(null, biz);
        }
      })
    }, function(err, results){
      //TODO handle error
      data.businesses = results;
      return res.status(200).json(data);
    });
  });
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
  //remove before add
  Thing.findOne({bar_id: req.body.bar_id}).remove(function(){
    Thing.create(req.body, function(err, thing) {
      if(err) { return handleError(res, err); }
      console.log(thing);
      return res.status(201).json(thing);
    });
  })
};

// Update users or Create new bar
exports.update = function(req, res) {
  //using bar_id instead of _id
  Thing.findOne({bar_id: req.params.id}).populate('users', 'name').exec(function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) {
      //create new bar
      Thing.create(req.body, function(err, newBar) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(newBar);
      })
    } else {
      //update users
      if (req.body.users[0] === 0) {
        //remove current user from users
        console.log(JSON.stringify(thing));
        var newUsers = thing.users.filter(function(user) {
          return user._id.toString() !== req.body.users[1]._id;
        });
        thing.users = newUsers;
      } else {
        //add current user to users
        thing.users = thing.users.concat(req.body.users);
      }

      thing.save(function (err) {
        if (err) { return handleError(res, err); }
        //console.log(thing);
        return res.status(200).json(thing);
      });

    }
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
