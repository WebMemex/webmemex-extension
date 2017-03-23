var select = require("js-select"),
    extend = require("./extend"),
    ClientMethods = require("./client-methods");

module.exports = JSObject;

function JSObject(client, obj) {
  this.initialize(client, obj.actor);
  this.obj = obj;
}

JSObject.prototype = extend(ClientMethods, {
  type: "object",

  get class() {
    return this.obj.class;
  },

  get name() {
    return this.obj.name;
  },

  get displayName() {
    return this.obj.displayName;
  },

  ownPropertyNames: function(cb) {
    this.request('ownPropertyNames', function(resp) {
      return resp.ownPropertyNames;
    }, cb);
  },

  ownPropertyDescriptor: function(name, cb) {
    this.request('property', { name: name }, function(resp) {
      return this.transformDescriptor(resp.descriptor);
    }.bind(this), cb);
  },

  ownProperties: function(cb) {
    this.request('prototypeAndProperties', function(resp) {
      return this.transformProperties(resp.ownProperties);
    }.bind(this), cb);
  },

  prototype: function(cb) {
    this.request('prototype', function(resp) {
      return this.createJSObject(resp.prototype);
    }.bind(this), cb);
  },

  ownPropertiesAndPrototype: function(cb) {
    this.request('prototypeAndProperties', function(resp) {
      resp.ownProperties = this.transformProperties(resp.ownProperties);
      resp.safeGetterValues = this.transformGetters(resp.safeGetterValues);
      resp.prototype = this.createJSObject(resp.prototype);

      return resp;
    }.bind(this), cb);
  },

  /* helpers */
  transformProperties: function(props) {
    var transformed = {};
    for (var prop in props) {
      transformed[prop] = this.transformDescriptor(props[prop]);
    }
    return transformed;
  },

  transformGetters: function(getters) {
    var transformed = {};
    for (var prop in getters) {
      transformed[prop] = this.transformGetter(getters[prop]);
    }
    return transformed;
  },

  transformDescriptor: function(descriptor) {
    descriptor.value = this.createJSObject(descriptor.value);
    return descriptor;
  },

  transformGetter: function(getter) {
    return {
      value: this.createJSObject(getter.getterValue),
      prototypeLevel: getter.getterPrototypeLevel,
      enumerable: getter.enumerable,
      writable: getter.writable
    }
  }
})