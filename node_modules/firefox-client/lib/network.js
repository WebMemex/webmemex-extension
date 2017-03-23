var extend = require("./extend");
var ClientMethods = require("./client-methods");

module.exports = Network;

function Network(client, actor) {
  this.initialize(client, actor);

  this.on("networkEvent", this.onNetworkEvent.bind(this));
}

Network.prototype = extend(ClientMethods, {
  types: ["NetworkActivity"],

  startLogging: function(cb) {
    this.request('startListeners', { listeners: this.types }, cb);
  },

  stopLogging: function(cb) {
    this.request('stopListeners', { listeners: this.types }, cb);
  },

  onNetworkEvent: function(event) {
    var networkEvent = new NetworkEvent(this.client, event.eventActor);

    this.emit("network-event", networkEvent);
  },

  sendHTTPRequest: function(request, cb) {
    this.request('sendHTTPRequest', { request: request }, function(resp) {
      return new NetworkEvent(this.client, resp.eventActor);
    }.bind(this), cb);
  }
})

function NetworkEvent(client, event) {
  this.initialize(client, event.actor);
  this.event = event;

  this.on("networkEventUpdate", this.onUpdate.bind(this));
}

NetworkEvent.prototype = extend(ClientMethods, {
  get url() {
   return this.event.url;
  },

  get method() {
    return this.event.method;
  },

  get isXHR() {
    return this.event.isXHR;
  },

  getRequestHeaders: function(cb) {
    this.request('getRequestHeaders', cb);
  },

  getRequestCookies: function(cb) {
    this.request('getRequestCookies', this.pluck('cookies'), cb);
  },

  getRequestPostData: function(cb) {
    this.request('getRequestPostData', cb);
  },

  getResponseHeaders: function(cb) {
    this.request('getResponseHeaders', cb);
  },

  getResponseCookies: function(cb) {
    this.request('getResponseCookies', this.pluck('cookies'), cb);
  },

  getResponseContent: function(cb) {
    this.request('getResponseContent', cb);
  },

  getEventTimings: function(cb) {
    this.request('getEventTimings', cb);
  },

  onUpdate: function(event) {
    var types = {
      "requestHeaders": "request-headers",
      "requestCookies": "request-cookies",
      "requestPostData": "request-postdata",
      "responseStart": "response-start",
      "responseHeaders": "response-headers",
      "responseCookies": "response-cookies",
      "responseContent": "response-content",
      "eventTimings": "event-timings"
    }

    var type = types[event.updateType];
    delete event.updateType;

    this.emit(type, event);
  }
})




