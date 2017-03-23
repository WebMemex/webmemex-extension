'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var urlparse = require('url');

var _require = require('fathom-web'),
    dom = _require.dom,
    rule = _require.rule,
    ruleset = _require.ruleset;

function makeUrlAbsolute(base, relative) {
  var relativeParsed = urlparse.parse(relative);

  if (relativeParsed.host === null) {
    return urlparse.resolve(base, relative);
  }

  return relative;
}

function getProvider(url) {
  return urlparse.parse(url).hostname.replace(/www[a-zA-Z0-9]*\./, '').replace('.co.', '.').split('.').slice(0, -1).join(' ');
}

function buildRuleset(name, rules, processors, scorers) {
  var reversedRules = Array.from(rules).reverse();
  var builtRuleset = ruleset.apply(undefined, _toConsumableArray(reversedRules.map(function (_ref, order) {
    var _ref2 = _slicedToArray(_ref, 2),
        query = _ref2[0],
        handler = _ref2[1];

    return rule(dom(query), function (node) {
      var score = order;

      if (scorers) {
        scorers.forEach(function (scorer) {
          var newScore = scorer(node, score);

          if (newScore) {
            score = newScore;
          }
        });
      }

      return [{
        flavor: name,
        score: score,
        notes: handler(node)
      }];
    });
  })));

  return function (doc, context) {
    var kb = builtRuleset.score(doc);
    var maxNode = kb.max(name);

    if (maxNode) {
      var _ret = function () {
        var value = maxNode.flavors.get(name);

        if (processors) {
          processors.forEach(function (processor) {
            value = processor(value, context);
          });
        }

        if (value) {
          if (value.trim) {
            return {
              v: value.trim()
            };
          }
          return {
            v: value
          };
        }
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
  };
}

var metadataRules = {
  description: {
    rules: [['meta[property="og:description"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[name="description"]', function (node) {
      return node.element.getAttribute('content');
    }]]
  },

  icon_url: {
    rules: [['link[rel="apple-touch-icon"]', function (node) {
      return node.element.getAttribute('href');
    }], ['link[rel="apple-touch-icon-precomposed"]', function (node) {
      return node.element.getAttribute('href');
    }], ['link[rel="icon"]', function (node) {
      return node.element.getAttribute('href');
    }], ['link[rel="fluid-icon"]', function (node) {
      return node.element.getAttribute('href');
    }], ['link[rel="shortcut icon"]', function (node) {
      return node.element.getAttribute('href');
    }], ['link[rel="Shortcut Icon"]', function (node) {
      return node.element.getAttribute('href');
    }], ['link[rel="mask-icon"]', function (node) {
      return node.element.getAttribute('href');
    }]],
    scorers: [
    // Handles the case where multiple icons are listed with specific sizes ie
    // <link rel="icon" href="small.png" sizes="16x16">
    // <link rel="icon" href="large.png" sizes="32x32">
    function (node, score) {
      var sizes = node.element.getAttribute('sizes');

      if (sizes) {
        var sizeMatches = sizes.match(/\d+/g);

        if (sizeMatches) {
          return sizeMatches.reduce(function (a, b) {
            return a * b;
          });
        }
      }
    }],
    processors: [function (icon_url, context) {
      return makeUrlAbsolute(context.url, icon_url);
    }]
  },

  image_url: {
    rules: [['meta[property="og:image:secure_url"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[property="og:image:url"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[property="og:image"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[name="twitter:image"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[property="twitter:image"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[name="thumbnail"]', function (node) {
      return node.element.getAttribute('content');
    }]],
    processors: [function (image_url, context) {
      return makeUrlAbsolute(context.url, image_url);
    }]
  },

  keywords: {
    rules: [['meta[name="keywords"]', function (node) {
      return node.element.getAttribute('content');
    }]],
    processors: [function (keywords) {
      return keywords.split(',').map(function (keyword) {
        return keyword.trim();
      });
    }]
  },

  title: {
    rules: [['meta[property="og:title"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[name="twitter:title"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[property="twitter:title"]', function (node) {
      return node.element.getAttribute('content');
    }], ['meta[name="hdl"]', function (node) {
      return node.element.getAttribute('content');
    }], ['title', function (node) {
      return node.element.text;
    }]]
  },

  type: {
    rules: [['meta[property="og:type"]', function (node) {
      return node.element.getAttribute('content');
    }]]
  },

  url: {
    rules: [['meta[property="og:url"]', function (node) {
      return node.element.getAttribute('content');
    }], ['link[rel="canonical"]', function (node) {
      return node.element.getAttribute('href');
    }]],
    processors: [function (url, context) {
      return makeUrlAbsolute(context.url, url);
    }]
  },

  provider: {
    rules: [['meta[property="og:site_name"]', function (node) {
      return node.element.getAttribute('content');
    }]]
  }
};

function getMetadata(doc, url, rules) {
  var metadata = {};
  var context = { url: url };
  var ruleSet = rules || metadataRules;

  Object.keys(ruleSet).map(function (metadataKey) {
    var metadataRule = ruleSet[metadataKey];

    if (Array.isArray(metadataRule.rules)) {
      var builtRule = buildRuleset(metadataKey, metadataRule.rules, metadataRule.processors, metadataRule.scorers);

      metadata[metadataKey] = builtRule(doc, context);
    } else {
      metadata[metadataKey] = getMetadata(doc, url, metadataRule);
    }
  });

  if (!metadata.url) {
    metadata.url = url;
  }

  if (url && !metadata.provider) {
    metadata.provider = getProvider(url);
  }

  if (url && !metadata.icon_url) {
    metadata.icon_url = makeUrlAbsolute(url, '/favicon.ico');
  }

  return metadata;
}

module.exports = {
  buildRuleset: buildRuleset,
  getMetadata: getMetadata,
  getProvider: getProvider,
  makeUrlAbsolute: makeUrlAbsolute,
  metadataRules: metadataRules
};