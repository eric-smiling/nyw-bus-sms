// Load the twilio module
var _ = require('lodash');
var twilio = require('twilio');
 
// Create a new REST API client to make authenticated requests against the
// twilio back end
var client = new twilio.RestClient('AC1c9ec815da5df5291b4757934d951861', '391de1dc96ed47569c1b2e83fcb9dcf4');
 
function send(options) {
  if(!options || !_.isString(options.to) || !_.isString(options.body) || !_.isFunction(options.complete)) {
    throw new Error('invalid sms.send arguments');
  }
  // Pass in parameters to the REST API using an object literal notation. The
  // REST client will handle authentication and response serialzation for you.
  client.sms.messages.create({
      to: options.to,
      from: '(646)480-6629',
      body: options.body
  }, function(error, message) {
      // The HTTP request to Twilio will run asynchronously. This callback
      // function will be called when a response is received from Twilio
      // The "error" variable will contain error information, if any.
      // If the request was successful, this value will be "falsy"
      if (!error) {
          // The second argument to the callback will contain the information
          // sent back by Twilio for the request. In this case, it is the
          // information about the text messsage you just sent:
          options.complete(null, message);
      } else {
          options.complete(error);
      }
  });
};

module.exports = {
  send: send
};