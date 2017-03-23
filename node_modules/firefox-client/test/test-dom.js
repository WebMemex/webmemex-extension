var assert = require("assert"),
    utils = require("./utils");

var doc;
var DOM;
var node;
var firstNode;
var lastNode;

before(function(done) {
  utils.loadTab('dom.html', function(aTab) {
    DOM = aTab.DOM;
    DOM.document(function(err, aDoc) {
      doc = aDoc;
      DOM.querySelectorAll(".item", function(err, list) {
        list.items(function(err, items) {
          firstNode = items[0];
          node = items[1];
          lastNode = items[2];
          done();
        })
      })
    })
  });
});

// DOM - document(), documentElement()

describe('document()', function() {
  it('should get document node', function(done) {
    DOM.document(function(err, doc) {
      assert.strictEqual(err, null);
      assert.equal(doc.nodeName, "#document");
      assert.equal(doc.nodeType, 9);
      done();
    })
  })
})


describe('documentElement()', function() {
  it('should get documentElement node', function(done) {
    DOM.documentElement(function(err, elem) {
      assert.strictEqual(err, null);
      assert.equal(elem.nodeName, "HTML");
      assert.equal(elem.nodeType, 1);
      done();
    })
  })
})

describe('querySelector()', function() {
  it('should get first item node', function(done) {
    DOM.querySelector(".item", function(err, child) {
      assert.strictEqual(err, null);
      assert.equal(child.getAttribute("id"), "test1");
      assert.ok(child.querySelector, "node has node methods");
      done();
    })
  })
})

describe('querySelector()', function() {
  it('should get all item nodes', function(done) {
    DOM.querySelectorAll(".item", function(err, list) {
      assert.strictEqual(err, null);
      assert.equal(list.length, 3);

      list.items(function(err, children) {
        assert.strictEqual(err, null);
        var ids = children.map(function(child) {
          assert.ok(child.querySelector, "list item has node methods");
          return child.getAttribute("id");
        })
        assert.deepEqual(ids, ["test1","test2","test3"]);
        done();
      })
    })
  })
})

// Node - parentNode(), parent(), siblings(), nextSibling(), previousSibling(),
// querySelector(), querySelectorAll(), innerHTML(), outerHTML(), getAttribute(),
// setAttribute()

describe('parentNode()', function() {
  it('should get parent node', function(done) {
    node.parentNode(function(err, parent) {
      assert.strictEqual(err, null);
      assert.equal(parent.nodeName, "SECTION");
      assert.ok(parent.querySelector, "parent has node methods");
      done();
    })
  })

  it('should be null for document parentNode', function(done) {
    doc.parentNode(function(err, parent) {
      assert.strictEqual(err, null);
      assert.strictEqual(parent, null);
      done();
    })
  })
})

describe('parents()', function() {
  it('should get ancestor nodes', function(done) {
    node.parents(function(err, ancestors) {
      assert.strictEqual(err, null);
      var names = ancestors.map(function(ancestor) {
        assert.ok(ancestor.querySelector, "ancestor has node methods");
        return ancestor.nodeName;
      })
      assert.deepEqual(names, ["SECTION","MAIN","BODY","HTML","#document"]);
      done();
    })
  })
})

describe('children()', function() {
  it('should get child nodes', function(done) {
    node.children(function(err, children) {
      assert.strictEqual(err, null);
      var ids = children.map(function(child) {
        assert.ok(child.querySelector, "child has node methods");
        return child.getAttribute("id");
      })
      assert.deepEqual(ids, ["child1","child2"]);
      done();
    })
  })
})

describe('siblings()', function() {
  it('should get sibling nodes', function(done) {
    node.siblings(function(err, siblings) {
      assert.strictEqual(err, null);
      var ids = siblings.map(function(sibling) {
        assert.ok(sibling.querySelector, "sibling has node methods");
        return sibling.getAttribute("id");
      })
      assert.deepEqual(ids, ["test1","test2","test3"]);
      done();
    })
  })
})

describe('nextSibling()', function() {
  it('should get next sibling node', function(done) {
    node.nextSibling(function(err, sibling) {
      assert.strictEqual(err, null);
      assert.equal(sibling.getAttribute("id"), "test3");
      assert.ok(sibling.querySelector, "next sibling has node methods");
      done();
    })
  })

  it('should be null if no next sibling', function(done) {
    lastNode.nextSibling(function(err, sibling) {
      assert.strictEqual(err, null);
      assert.strictEqual(sibling, null);
      done();
    })
  })
})

describe('previousSibling()', function() {
  it('should get next sibling node', function(done) {
    node.previousSibling(function(err, sibling) {
      assert.strictEqual(err, null);
      assert.equal(sibling.getAttribute("id"), "test1");
      assert.ok(sibling.querySelector, "next sibling has node methods");
      done();
    })
  })

  it('should be null if no prev sibling', function(done) {
    firstNode.previousSibling(function(err, sibling) {
      assert.strictEqual(err, null);
      assert.strictEqual(sibling, null);
      done();
    })
  })
})

describe('querySelector()', function() {
  it('should get first child node', function(done) {
    node.querySelector("*", function(err, child) {
      assert.strictEqual(err, null);
      assert.equal(child.getAttribute("id"), "child1");
      assert.ok(child.querySelector, "node has node methods");
      done();
    })
  })

  it('should be null if no nodes with selector', function(done) {
    node.querySelector("blarg", function(err, resp) {
      assert.strictEqual(err, null);
      assert.strictEqual(resp, null);
      done();
    })
  })
})

describe('querySelectorAll()', function() {
  it('should get all child nodes', function(done) {
    node.querySelectorAll("*", function(err, list) {
      assert.strictEqual(err, null);
      assert.equal(list.length, 2);

      list.items(function(err, children) {
        assert.strictEqual(err, null);
        var ids = children.map(function(child) {
          assert.ok(child.querySelector, "list item has node methods");
          return child.getAttribute("id");
        })
        assert.deepEqual(ids, ["child1", "child2"]);
        done();
      })
    })
  })

  it('should get nodes from "start" to "end"', function(done) {
    doc.querySelectorAll(".item", function(err, list) {
      assert.strictEqual(err, null);
      assert.equal(list.length, 3);

      list.items(1, 2, function(err, items) {
        assert.strictEqual(err, null);
        assert.equal(items.length, 1);
        assert.deepEqual(items[0].getAttribute("id"), "test2")
        done();
      })
    })
  })

  it('should get nodes from "start"', function(done) {
    doc.querySelectorAll(".item", function(err, list) {
      assert.strictEqual(err, null);
      assert.equal(list.length, 3);

      list.items(1, function(err, items) {
        assert.strictEqual(err, null);
        assert.equal(items.length, 2);
        var ids = items.map(function(item) {
          assert.ok(item.querySelector, "list item has node methods");
          return item.getAttribute("id");
        })
        assert.deepEqual(ids, ["test2","test3"]);
        done();
      })
    })
  })

  it('should be empty list if no nodes with selector', function(done) {
    node.querySelectorAll("blarg", function(err, list) {
      assert.strictEqual(err, null);
      assert.equal(list.length, 0);

      list.items(function(err, items) {
        assert.strictEqual(err, null);
        assert.deepEqual(items, []);
        done();
      })
    })
  })
})

describe('innerHTML()', function() {
  it('should get innerHTML of node', function(done) {
    node.innerHTML(function(err, text) {
      assert.strictEqual(err, null);
      assert.equal(text, '\n          <div id="child1"></div>\n'
                   + '          <div id="child2"></div>\n      ');
      done();
    })
  })
})

describe('outerHTML()', function() {
  it('should get outerHTML of node', function(done) {
    node.outerHTML(function(err, text) {
      assert.strictEqual(err, null);
      assert.equal(text, '<div id="test2" class="item">\n'
                   + '          <div id="child1"></div>\n'
                   + '          <div id="child2"></div>\n      '
                   + '</div>');
      done();
    })
  })
})

describe('highlight()', function() {
  it('should highlight node', function(done) {
    node.highlight(function(err, resp) {
      assert.strictEqual(err, null);
      done();
    })
  })
})

/* MUST BE LAST */
describe('remove()', function() {
  it('should remove node', function(done) {
    node.remove(function(err, nextSibling) {
      assert.strictEqual(err, null);
      assert.equal(nextSibling.getAttribute("id"), "test3");

      doc.querySelectorAll(".item", function(err, list) {
        assert.strictEqual(err, null);
        assert.equal(list.length, 2);
        done();
      })
    })
  })

  it("should err if performing further operations after release()", function(done) {
    node.release(function(err) {
      assert.strictEqual(err, null);

      node.innerHTML(function(err, text) {
        assert.equal(err.message, "TypeError: node is null")
        assert.equal(err.toString(), "unknownError: TypeError: node is null");
        done();
      })
    })
  })
})


