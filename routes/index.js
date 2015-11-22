var express = require('express');
var router = express.Router();
var _ = require('lodash');
var rest = require('restler');
var proxy = require('express-http-proxy');
var zlib = require('zlib');
var nyw = require('../lib/nyw');
var sms = require('../lib/sms');
var pois = nyw.getRanges();
var JFID;


//////////
// SMS POI
//////////
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
      // JF bus is the only bus that enters the back entrance
      if(poi.key === 'back_entrance') {
        // keep the ID in memory across requests
        JFID = vehicles[0].o;
        console.log('SMS::SET JF BUS ID to ' + JFID);
      }
    } else {
      res.send({
        'vehicles': [],
        'poi': poi,
        'sms_sent': false
      });
    }
  });
});


///////////
// FAUX MAP
///////////
router.get('/faux-map', function(req, res) {
  res.render('../views/faux-map.html');
});

router.get('/faux-vehicle-positions', proxy('tds1.saucontech.com', {
  forwardPath: function(req, res) {
    return '/tds-map/nyw/nywvehiclePositions.do?id=52';
  },
  decorateRequest: function(req) {
    req.headers['accept-encoding'] = 'identity';
  },
  intercept: function(rsp, data, req, res, callback) {
    
    var jfVehicle;
    var filteredData;
    
    // parse saucontech response
    data = JSON.parse(data.toString('utf8'));
    
    // a vehicle in the back entrance is the JF vehicle
    jfVehicle = _.find(data, function(vehicle) {
      return nyw.isInRange('back_entrance', vehicle);
    });
    
    // if there is one
    if(jfVehicle) {
      // store its vehicle ID in memory for use by subsequent requests
      JFID = jfVehicle.o;
      console.log('FAUX::SET JFID to ' + JFID);
    }
    
    // JFID may have been set by other requests
    if(JFID) {
      // if present, hide all other buses
      filteredData = _.filter(data, function(item) {
        return item.o == JFID;
      });
      if(filteredData.length) {
        data = filteredData;
      }
    }
    callback(null, JSON.stringify(data));
  }
}));


////////
// DEBUG
////////
router.get('/ranges', function(req,res) {
  res.json(nyw.getRanges());
});

module.exports = router;