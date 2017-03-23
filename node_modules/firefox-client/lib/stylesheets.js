var extend = require("./extend");
var ClientMethods = require("./client-methods");

module.exports = StyleSheets;

function StyleSheets(client, actor) {
  this.initialize(client, actor);
}

StyleSheets.prototype = extend(ClientMethods, {
  getStyleSheets: function(cb) {
    this.request('getStyleSheets', function(resp) {
      return resp.styleSheets.map(function(sheet) {
        return new StyleSheet(this.client, sheet);
      }.bind(this));
    }.bind(this), cb);
  },

  addStyleSheet: function(text, cb) {
    this.request('addStyleSheet', { text: text }, function(resp) {
      return new StyleSheet(this.client, resp.styleSheet);
    }.bind(this), cb);
  }
})

function StyleSheet(client, sheet) {
  this.initialize(client, sheet.actor);
  this.sheet = sheet;

  this.on("propertyChange", this.onPropertyChange.bind(this));
}

StyleSheet.prototype = extend(ClientMethods, {
  get href() {
    return this.sheet.href;
  },

  get disabled() {
    return this.sheet.disabled;
  },

  get ruleCount() {
    return this.sheet.ruleCount;
  },

  onPropertyChange: function(event) {
    this.sheet[event.property] = event.value;
    this.emit(event.property + "-changed", event.value);
  },

  toggleDisabled: function(cb) {
    this.request('toggleDisabled', function(err, resp) {
      if (err) return cb(err);

      this.sheet.disabled = resp.disabled;
      cb(null, resp.disabled);
    }.bind(this));
  },

  getOriginalSources: function(cb) {
    this.request('getOriginalSources', function(resp) {
      if (resp.originalSources === null) {
        return [];
      }
      return resp.originalSources.map(function(form) {
        return new OriginalSource(this.client, form);
      }.bind(this));
    }.bind(this), cb);
  },

  update: function(text, cb) {
    this.request('update', { text: text, transition: true }, cb);
  },

  getText: function(cb) {
    this.request('getText', this.pluck('text'), cb);
  }
});


function OriginalSource(client, source) {
  console.log("source", source);
  this.initialize(client, source.actor);

  this.source = source;
}

OriginalSource.prototype = extend(ClientMethods, {
  get url()  {
    return this.source.url
  },

  getText: function(cb) {
    this.request('getText', this.pluck('text'), cb);
  }
});
