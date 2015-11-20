// TODO: prevent spam
// TODO: keep list of active SMS users

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var rest = require('restler');
var nyw = require('../lib/nyw');
var sms = require('../lib/sms');


router.get('/map', function(req, res) {
  res.render('../views/map.html');
});

router.post('/vehicles/:range_key', function(req, res, next) {
  if(!nyw.isValidKey(req.params.range_key)) {
    return res.send({"error": "invalid range key"});
  }
  if(!/^\d{10}$/.test(req.body.to)) {
    return res.send({"error": "invalid phone number"});
  }
  
  // validate
  nyw.findVehiclesInRange(req.params.range_key, function(vehicles, positions){
    if(vehicles.length) {
      sms.send({
        to: '+1' + req.body.to,
        body: 'Bus arrived @ ' + req.params.range_key,
        complete: function(error, message) {
          res.send({
            'vehicles': vehicles,
            'sms_sent': true
          });
        }
      });
    } else {
      res.send({
        'vehicles': []
      });
    }
  });
});

module.exports = router;