var express = require('express');
var router = express.Router();
var _ = require('lodash');
var rest = require('restler');
var nyw = require('../lib/nyw');
var sms = require('../lib/sms');
var pois = nyw.getRanges();

router.get('/poi-form', function(req, res) {
  res.render('../views/poi-form.html', {
    pois: pois
  });
});

router.post('/poi/vehicles', function(req, res, next) {
  var poi = pois[req.body.poi];
  
  if(!nyw.isPOI(req.body.poi)) {
    return res.send({"error": "invalid POI"});
  }
  if(!/^\d{10}$/.test(req.body.to)) {
    return res.send({"error": "invalid phone number"});
  }
  
  nyw.findVehiclesInRange(poi.key, function(vehicles, positions){
    if(vehicles.length) {
      sms.send({
        to: '+1' + req.body.to,
        body: 'Bus arrived @ ' + poi.name,
        complete: function(error, message) {
          res.send({
            'vehicles': vehicles,
            'msg': 'Bus arrived @ ' + poi.name,
            'sms_sent': true,
            'poi': poi
          });
        }
      });
    } else {
      res.send({
        'vehicles': [],
        'poi': poi,
        'sms_sent': false
      });
    }
  });
});

router.get('/ranges', function(req,res) {
  res.json(nyw.getRanges());
});

module.exports = router;