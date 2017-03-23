var events = require("events"),
    extend = require("./extend");

// to be instantiated later - to avoid circular dep resolution
var JSObject;

var ClientMethods = extend(events.EventEmitter.prototype, {
  /**
   * Intialize this client object.
   *
   * @param  {object} client
   *         Client to send requests on.
   * @param  {string} actor
   *         Actor id to set as 'from' field on requests
   */
  initialize: function(client, actor) {
    this.client = client;
    this.actor = actor;

    this.client.on('message', function(message) {
      if (message.from == this.actor) {
        this.emit(message.type, message);
      }
    }.bind(this));
  },

  /**
   * Make request to our actor on the server.
   *
   * @param  {string}   type
   *         Method name of the request
   * @param  {object}   message
   *         Optional extra properties (arguments to method)
   * @param  {Function}   transform
   *         Optional tranform for response object. Takes response object
   *         and returns object to send on.
   * @param  {Function} callback
   *         Callback to call with (maybe transformed) response
   */
  request: function(type, message, transform, callback) {
    if (typeof message == "function") {
      if (typeof transform == "function") {
        // (type, trans, cb)
        callback = transform;
        transform = message;
      }
      else {
        // (type, cb)
        callback = message;
      }
      message = {};
    }
    else if (!callback) {
      if (!message) {
        // (type)
        message = {};
      }
      // (type, message, cb)
      callback = transform;
      transform = null;
    }

    message.to = this.actor;
    message.type = type;

    this.client.makeRequest(message, function(resp) {
      delete resp.from;

      if (resp.error) {
        var err = new Error(resp.message);
        err.name = resp.error;

        callback(err);
        return;
      }

      if (transform) {
        resp = transform(resp);
      }

      if (callback) {
        callback(null, resp);
      }
    });
  },

  /*
   * Transform obj response into a JSObject
   */
  createJSObject: function(obj) {
    if (obj == null) {
      return;
    }
    if (!JSObject) {
      // circular dependencies
      JSObject = require("./jsobject");
    }
    if (obj.type == "object") {
      return new JSObject(this.client, obj);
    }
    return obj;
  },

  /**
   * Create function that plucks out only one value from an object.
   * Used as the transform function for some responses.
   */
  pluck: function(prop) {
    return function(obj) {
      return obj[prop];
    }
  }
})

module.exports = ClientMethods;