// TODO: prevent spam
// TODO: keep list of active SMS users
// TODO: hide/don't count incorrect bus ids
// TODO: keep track of actual bus id based on entrance entry

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var rest = require('restler');
var nyw = require('../lib/nyw');
var sms = require('../lib/sms');


router.get('/map', function(req, res) {
  res.render('../views/map.html');
});

router.get('/poi-form', function(req, res) {
  res.render('../views/poi-form.html', {
    pois: nyw.getRanges()
  });
});

router.post('/poi/vehicles', function(req, res, next) {
  if(!nyw.isPOI(req.body.poi)) {
    return res.send({"error": "invalid POI"});
  }
  if(!/^\d{10}$/.test(req.body.to)) {
    return res.send({"error": "invalid phone number"});
  }
  
  // validate
  nyw.findVehiclesInRange(req.body.poi, function(vehicles, positions){
    if(vehicles.length) {
    /*
      sms.send({
        to: '+1' + req.body.to,
        body: 'Bus arrived @ ' + req.body.poi,
        complete: function(error, message) {
          res.send({
            'vehicles': vehicles,
            'sms_sent': true
          });
        }
      });
    */
      res.send({
        'vehicles': vehicles,
        'sms_sent': true
      });
    } else {
      res.send({
        'vehicles': []
      });
    }
  });
});

router.get('/ranges', function(req,res) {
  res.json(nyw.getRanges());
});

module.exports = router;