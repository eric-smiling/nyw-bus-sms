var _ = require('lodash');
var rest = require('restler');
var ranges = require('./nyw-ranges');

module.exports = {
  getVehiclePositions: function(callback) {
    rest.get(
      'http://tds1.saucontech.com/tds-map/nyw/nywvehiclePositions.do', { 
      query: {
        id: 52,
        time: new Date().getTime()
      } 
    })
    .on('complete', callback);
  },
  isValidKey: function(key) {
    if(!_.isString(key) || !_.include(_.keys(ranges), key)) {
      return false;
    }
    return true
  },
  isInRange: function(key, position) {
    var range;
    if(!this.isValidKey(key)) {
      throw 'invalid key';
    }
    range = ranges[key];
    if(_.contains(range.x, position.x) && 
      _.contains(range.y, position.y)) {
      return true;
    }
    return false;
  },
  findVehiclesInRange: function(key, callback) {
    var self = this;
    if(!self.isValidKey(key)) {
      throw 'invalid key';
    }
    self.getVehiclePositions(function(positions) {
      var vehicles = _.filter(positions, function(position){
        return self.isInRange(key, position);
      });
      callback(vehicles, positions);
    });
  }
};