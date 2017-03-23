var extend = require("./extend"),
    ClientMethods = require("./client-methods");

module.exports = Node;

function Node(client, walker, node) {
  this.initialize(client, node.actor);
  this.walker = walker;

  this.getNode = this.getNode.bind(this);
  this.getNodeArray = this.getNodeArray.bind(this);
  this.getNodeList = this.getNodeList.bind(this);

  walker.on('newMutations', function(event) {
    //console.log("on new mutations! ", JSON.stringify(event));
  });

  ['nodeType', 'nodeName', 'namespaceURI', 'attrs']
  .forEach(function(attr) {
    this[attr] = node[attr];
  }.bind(this));
}

Node.prototype = extend(ClientMethods, {
  getAttribute: function(name) {
    for (var i in this.attrs) {
      var attr = this.attrs[i];
      if (attr.name == name) {
        return attr.value;
      }
    }
  },

  setAttribute: function(name, value, cb) {
    var mods = [{
      attributeName: name,
      newValue: value
    }];
    this.request('modifyAttributes', { modifications: mods }, cb);
  },

  parentNode: function(cb) {
    this.parents(function(err, nodes) {
      if (err) {
        return cb(err);
      }
      var node = null;
      if (nodes.length) {
        node = nodes[0];
      }
      cb(null, node);
    })
  },

  parents: function(cb) {
    this.nodeRequest('parents', this.getNodeArray, cb);
  },

  children: function(cb) {
    this.nodeRequest('children', this.getNodeArray, cb);
  },

  siblings: function(cb) {
    this.nodeRequest('siblings', this.getNodeArray, cb);
  },

  nextSibling: function(cb) {
    this.nodeRequest('nextSibling', this.getNode, cb);
  },

  previousSibling: function(cb) {
    this.nodeRequest('previousSibling', this.getNode, cb);
  },

  querySelector: function(selector, cb) {
    this.nodeRequest('querySelector', { selector: selector },
                     this.getNode, cb);
  },

  querySelectorAll: function(selector, cb) {
    this.nodeRequest('querySelectorAll', { selector: selector },
                     this.getNodeList, cb);
  },

  innerHTML: function(cb) {
    this.nodeRequest('innerHTML', function(resp) {
      return resp.value;
    }, cb)
  },

  outerHTML: function(cb) {
    this.nodeRequest('outerHTML', function(resp) {
      return resp.value;
    }, cb)
  },

  remove: function(cb) {
    this.nodeRequest('removeNode', function(resp) {
      return new Node(this.client, this.walker, resp.nextSibling);
    }.bind(this), cb);
  },

  highlight: function(cb) {
    this.nodeRequest('highlight', cb);
  },

  release: function(cb) {
    this.nodeRequest('releaseNode', cb);
  },

  getNode: function(resp) {
    if (resp.node) {
      return new Node(this.client, this.walker, resp.node);
    }
    return null;
  },

  getNodeArray: function(resp) {
    return resp.nodes.map(function(form) {
      return new Node(this.client, this.walker, form);
    }.bind(this));
  },

  getNodeList: function(resp) {
    return new NodeList(this.client, this.walker, resp.list);
  },

  nodeRequest: function(type, message, transform, cb) {
    if (!cb) {
      cb = transform;
      transform = message;
      message = {};
    }
    message.node = this.actor;

    this.walker.request(type, message, transform, cb);
  }
});

function NodeList(client, walker, list) {
  this.client = client;
  this.walker = walker;
  this.actor = list.actor;

  this.length = list.length;
}

NodeList.prototype = extend(ClientMethods, {
  items: function(start, end, cb) {
    if (typeof start == "function") {
      cb = start;
      start = 0;
      end = this.length;
    }
    else if (typeof end == "function") {
      cb = end;
      end = this.length;
    }
    this.request('items', { start: start, end: end },
      this.getNodeArray.bind(this), cb);
  },

  // TODO: add this function to ClientMethods
  getNodeArray: function(resp) {
    return resp.nodes.map(function(form) {
      return new Node(this.client, this.walker, form);
    }.bind(this));
  }
});
