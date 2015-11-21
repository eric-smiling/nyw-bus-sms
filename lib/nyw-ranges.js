var _ = require('lodash');
var pois = require('../data/points-of-interest.json');
var rangeSize = {
  x: 40,
  y: 40
};
var coordinatesToRange = function(coords) {
  var avg = function(nums){
    return _.reduce(nums, function(total, n) {
      return total + n;
    }) / nums.length;
  };
  var avgs = {
    x: avg(_.pluck(coords, 'x')),
    y: avg(_.pluck(coords, 'y'))
  };
  return {
    x: _.range(avgs.x - Math.round(rangeSize.x/2), avgs.x + Math.round(rangeSize.x/2)),
    y: _.range(avgs.y - Math.round(rangeSize.y/2), avgs.y + Math.round(rangeSize.y/2))
  };
}
var ranges = _.mapValues(pois, function(poi) {
  return _.extend(
    coordinatesToRange(poi.coordinates),
    {
      "name": poi.name
    }
  );
});
_.extend(
  ranges,
  {
    "entrance": {
      x: _.range(640,665),
      y: _.range(50, 130),
      name: "Back entrance"
    }
  }
);
module.exports = ranges;