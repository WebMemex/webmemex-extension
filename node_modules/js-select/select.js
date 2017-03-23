var select = (function() {
	var require = function (file, cwd) {
	    var resolved = require.resolve(file, cwd || '/');
	    var mod = require.modules[resolved];
	    if (!mod) throw new Error(
	        'Failed to resolve module ' + file + ', tried ' + resolved
	    );
	    var cached = require.cache[resolved];
	    var res = cached? cached.exports : mod();
	    return res;
	};

	require.paths = [];
	require.modules = {};
	require.cache = {};
	require.extensions = [".js",".coffee"];

	require._core = {
	    'assert': true,
	    'events': true,
	    'fs': true,
	    'path': true,
	    'vm': true
	};

	require.resolve = (function () {
	    return function (x, cwd) {
	        if (!cwd) cwd = '/';
        
	        if (require._core[x]) return x;
	        var path = require.modules.path();
	        cwd = path.resolve('/', cwd);
	        var y = cwd || '/';
        
	        if (x.match(/^(?:\.\.?\/|\/)/)) {
	            var m = loadAsFileSync(path.resolve(y, x))
	                || loadAsDirectorySync(path.resolve(y, x));
	            if (m) return m;
	        }
        
	        var n = loadNodeModulesSync(x, y);
	        if (n) return n;
        
	        throw new Error("Cannot find module '" + x + "'");
        
	        function loadAsFileSync (x) {
	            x = path.normalize(x);
	            if (require.modules[x]) {
	                return x;
	            }
            
	            for (var i = 0; i < require.extensions.length; i++) {
	                var ext = require.extensions[i];
	                if (require.modules[x + ext]) return x + ext;
	            }
	        }
        
	        function loadAsDirectorySync (x) {
	            x = x.replace(/\/+$/, '');
	            var pkgfile = path.normalize(x + '/package.json');
	            if (require.modules[pkgfile]) {
	                var pkg = require.modules[pkgfile]();
	                var b = pkg.browserify;
	                if (typeof b === 'object' && b.main) {
	                    var m = loadAsFileSync(path.resolve(x, b.main));
	                    if (m) return m;
	                }
	                else if (typeof b === 'string') {
	                    var m = loadAsFileSync(path.resolve(x, b));
	                    if (m) return m;
	                }
	                else if (pkg.main) {
	                    var m = loadAsFileSync(path.resolve(x, pkg.main));
	                    if (m) return m;
	                }
	            }
            
	            return loadAsFileSync(x + '/index');
	        }
        
	        function loadNodeModulesSync (x, start) {
	            var dirs = nodeModulesPathsSync(start);
	            for (var i = 0; i < dirs.length; i++) {
	                var dir = dirs[i];
	                var m = loadAsFileSync(dir + '/' + x);
	                if (m) return m;
	                var n = loadAsDirectorySync(dir + '/' + x);
	                if (n) return n;
	            }
            
	            var m = loadAsFileSync(x);
	            if (m) return m;
	        }
        
	        function nodeModulesPathsSync (start) {
	            var parts;
	            if (start === '/') parts = [ '' ];
	            else parts = path.normalize(start).split('/');
            
	            var dirs = [];
	            for (var i = parts.length - 1; i >= 0; i--) {
	                if (parts[i] === 'node_modules') continue;
	                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
	                dirs.push(dir);
	            }
            
	            return dirs;
	        }
	    };
	})();

	require.alias = function (from, to) {
	    var path = require.modules.path();
	    var res = null;
	    try {
	        res = require.resolve(from + '/package.json', '/');
	    }
	    catch (err) {
	        res = require.resolve(from, '/');
	    }
	    var basedir = path.dirname(res);
    
	    var keys = (Object.keys || function (obj) {
	        var res = [];
	        for (var key in obj) res.push(key);
	        return res;
	    })(require.modules);
    
	    for (var i = 0; i < keys.length; i++) {
	        var key = keys[i];
	        if (key.slice(0, basedir.length + 1) === basedir + '/') {
	            var f = key.slice(basedir.length);
	            require.modules[to + f] = require.modules[basedir + f];
	        }
	        else if (key === basedir) {
	            require.modules[to] = require.modules[basedir];
	        }
	    }
	};

	(function () {
	    var process = {};
    
	    require.define = function (filename, fn) {
	        if (require.modules.__browserify_process) {
	            process = require.modules.__browserify_process();
	        }
        
	        var dirname = require._core[filename]
	            ? ''
	            : require.modules.path().dirname(filename)
	        ;
        
	        var require_ = function (file) {
	            var requiredModule = require(file, dirname);
	            var cached = require.cache[require.resolve(file, dirname)];

	            if (cached && cached.parent === null) {
	                cached.parent = module_;
	            }

	            return requiredModule;
	        };
	        require_.resolve = function (name) {
	            return require.resolve(name, dirname);
	        };
	        require_.modules = require.modules;
	        require_.define = require.define;
	        require_.cache = require.cache;
	        var module_ = {
	            id : filename,
	            filename: filename,
	            exports : {},
	            loaded : false,
	            parent: null
	        };
        
	        require.modules[filename] = function () {
	            require.cache[filename] = module_;
	            fn.call(
	                module_.exports,
	                require_,
	                module_,
	                module_.exports,
	                dirname,
	                filename,
	                process
	            );
	            module_.loaded = true;
	            return module_.exports;
	        };
	    };
	})();


	require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (fn(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length; i >= 0; i--) {
	    var last = parts[i];
	    if (last == '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Regex to split a filename into [*, dir, basename, ext]
	// posix version
	var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	var resolvedPath = '',
	    resolvedAbsolute = false;

	for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
	  var path = (i >= 0)
	      ? arguments[i]
	      : process.cwd();

	  // Skip empty and invalid entries
	  if (typeof path !== 'string' || !path) {
	    continue;
	  }

	  resolvedPath = path + '/' + resolvedPath;
	  resolvedAbsolute = path.charAt(0) === '/';
	}

	// At this point the path should be resolved to a full absolute path, but
	// handle relative paths to be safe (might happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	var isAbsolute = path.charAt(0) === '/',
	    trailingSlash = path.slice(-1) === '/';

	// Normalize the path
	path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }
  
	  return (isAbsolute ? '/' : '') + path;
	};


	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    return p && typeof p === 'string';
	  }).join('/'));
	};


	exports.dirname = function(path) {
	  var dir = splitPathRe.exec(path)[1] || '';
	  var isWindows = false;
	  if (!dir) {
	    // No dirname
	    return '.';
	  } else if (dir.length === 1 ||
	      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
	    // It is just a slash or a drive letter with a slash
	    return dir;
	  } else {
	    // It is a full dirname, strip trailing slash
	    return dir.substring(0, dir.length - 1);
	  }
	};


	exports.basename = function(path, ext) {
	  var f = splitPathRe.exec(path)[2] || '';
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPathRe.exec(path)[3] || '';
	};
	});

	require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

	process.nextTick = (function () {
	    var queue = [];
	    var canPost = typeof window !== 'undefined'
	        && window.postMessage && window.addEventListener
	    ;
    
	    if (canPost) {
	        window.addEventListener('message', function (ev) {
	            if (ev.source === window && ev.data === 'browserify-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);
	    }
    
	    return function (fn) {
	        if (canPost) {
	            queue.push(fn);
	            window.postMessage('browserify-tick', '*');
	        }
	        else setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	process.binding = function (name) {
	    if (name === 'evals') return (require)('vm')
	    else throw new Error('No such module. (Possibly not yet loaded)')
	};

	(function () {
	    var cwd = '/';
	    var path;
	    process.cwd = function () { return cwd };
	    process.chdir = function (dir) {
	        if (!path) path = require('path');
	        cwd = path.resolve(dir, cwd);
	    };
	})();
	});

	require.define("vm",function(require,module,exports,__dirname,__filename,process){module.exports = require("vm-browserify")});

	require.define("/node_modules/vm-browserify/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

	require.define("/node_modules/vm-browserify/index.js",function(require,module,exports,__dirname,__filename,process){var Object_keys = function (obj) {
	    if (Object.keys) return Object.keys(obj)
	    else {
	        var res = [];
	        for (var key in obj) res.push(key)
	        return res;
	    }
	};

	var forEach = function (xs, fn) {
	    if (xs.forEach) return xs.forEach(fn)
	    else for (var i = 0; i < xs.length; i++) {
	        fn(xs[i], i, xs);
	    }
	};

	var Script = exports.Script = function NodeScript (code) {
	    if (!(this instanceof Script)) return new Script(code);
	    this.code = code;
	};

	Script.prototype.runInNewContext = function (context) {
	    if (!context) context = {};
    
	    var iframe = document.createElement('iframe');
	    if (!iframe.style) iframe.style = {};
	    iframe.style.display = 'none';
    
	    document.body.appendChild(iframe);
    
	    var win = iframe.contentWindow;
    
	    forEach(Object_keys(context), function (key) {
	        win[key] = context[key];
	    });
     
	    if (!win.eval && win.execScript) {
	        // win.eval() magically appears when this is called in IE:
	        win.execScript('null');
	    }
    
	    var res = win.eval(this.code);
    
	    forEach(Object_keys(win), function (key) {
	        context[key] = win[key];
	    });
    
	    document.body.removeChild(iframe);
    
	    return res;
	};

	Script.prototype.runInThisContext = function () {
	    return eval(this.code); // maybe...
	};

	Script.prototype.runInContext = function (context) {
	    // seems to be just runInNewContext on magical context objects which are
	    // otherwise indistinguishable from objects except plain old objects
	    // for the parameter segfaults node
	    return this.runInNewContext(context);
	};

	forEach(Object_keys(Script.prototype), function (name) {
	    exports[name] = Script[name] = function (code) {
	        var s = Script(code);
	        return s[name].apply(s, [].slice.call(arguments, 1));
	    };
	});

	exports.createScript = function (code) {
	    return exports.Script(code);
	};

	exports.createContext = Script.createContext = function (context) {
	    // not really sure what this one does
	    // seems to just make a shallow copy
	    var copy = {};
	    if(typeof context === 'object') {
	        forEach(Object_keys(context), function (key) {
	            copy[key] = context[key];
	        });
	    }
	    return copy;
	};
	});

	require.define("/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"./index"}});

	require.define("js-select",function(require,module,exports,__dirname,__filename,process){var traverse = require("traverse"),
	    JSONSelect = require("JSONSelect");

	module.exports = function(obj, string) {
	   var sels = parseSelectors(string);

	   return {
	      nodes: function() {
	         var nodes = [];
	         this.forEach(function(node) {
	            nodes.push(node);
	         });
	         return nodes;
	      },
      
	      update: function(cb) {
	         this.forEach(function(node) {
	            this.update(typeof cb == "function" ? cb(node) : cb);
	         });
	      },
      
	      remove: function() {
	         this.forEach(function(node) {
	            this.remove();
	         })
	      },
      
	      condense: function() {
	         traverse(obj).forEach(function(node) {
	            if (!this.parent) return;
            
	            if (this.parent.keep) {
	               this.keep = true;
	            } else {
	               var match = matchesAny(sels, this);
	               this.keep = match;
	               if (!match) {
	                  if (this.isLeaf) {
	                     this.remove();
	                  } else {
	                     this.after(function() {
	                        if (this.keep_child) {
	                           this.parent.keep_child = true;
	                        }
	                        if (!this.keep && !this.keep_child) {
	                           this.remove();
	                        }
	                     });
	                  }
	               } else {
	                  this.parent.keep_child = true;
	               }
	            }
	         });
	      },
      
	      forEach: function(cb) {
	         traverse(obj).forEach(function(node) {
	            if (matchesAny(sels, this)) {
	               this.matches = function(string) {
	                  return matchesAny(parseSelectors(string), this);
	               };
	               // inherit context from js-traverse
	               cb.call(this, node);            
	            }
	         });
	      }
	   };
	}

	function parseSelectors(string) {
	   var parsed = JSONSelect._parse(string || "*")[1];
	   return getSelectors(parsed);
	}

	function getSelectors(parsed) {
	   if (parsed[0] == ",") {  // "selector1, selector2"
	      return parsed.slice(1);
	   }
	   return [parsed];
	}

	function matchesAny(sels, context) {
	   for (var i = 0; i < sels.length; i++) {
	      if (matches(sels[i], context)) {
	         return true;
	      }
	   }
	   return false;
	}

	function matches(sel, context) {
	   var path = context.parents.concat([context]),
	       i = path.length - 1,
	       j = sel.length - 1;

	   // walk up the ancestors
	   var must = true;
	   while(j >= 0 && i >= 0) {
	      var part = sel[j],
	          context = path[i];

	      if (part == ">") {
	         j--;
	         must = true;
	         continue;
	      }

	      if (matchesKey(part, context)) {
	         j--;
	      }
	      else if (must) {
	         return false;
	      }

	      i--;
	      must = false;
	   }
	   return j == -1;
	}

	function matchesKey(part, context) {
	   var key = context.key,
	       node = context.node,
	       parent = context.parent;

	   if (part.id && key != part.id) {
	      return false;
	   }
	   if (part.type) {
	      var type = part.type;

	      if (type == "null" && node !== null) {
	         return false;
	      }
	      else if (type == "array" && !isArray(node)) {
	         return false;
	      }
	      else if (type == "object" && (typeof node != "object"
	                 || node === null || isArray(node))) {
	         return false;
	      }
	      else if ((type == "boolean" || type == "string" || type == "number")
	               && type != typeof node) {
	         return false;
	      }
	   }
	   if (part.pf == ":nth-child") {
	      var index = parseInt(key) + 1;
	      if ((part.a == 0 && index !== part.b)         // :nth-child(i)
	        || (part.a == 1 && !(index >= -part.b))     // :nth-child(n)
	        || (part.a == -1 && !(index <= part.b))     // :nth-child(-n + 1)
	        || (part.a == 2 && index % 2 != part.b)) {  // :nth-child(even)
	         return false;
	      }
	   }
	   if (part.pf == ":nth-last-child"
	      && (!parent || key != parent.node.length - part.b)) {
	         return false;
	   }
	   if (part.pc == ":only-child"
	      && (!parent || parent.node.length != 1)) {
	         return false;
	   }
	   if (part.pc == ":root" && key !== undefined) {
	      return false;
	   }
	   if (part.has) {
	      var sels = getSelectors(part.has[0]),
	          match = false;
	      traverse(node).forEach(function(child) {
	         if (matchesAny(sels, this)) {
	            match = true;
	         }
	      });
	      if (!match) {
	         return false;
	      }
	   }
	   if (part.expr) {
	      var expr = part.expr, lhs = expr[0], op = expr[1], rhs = expr[2];
	      if (typeof node != "string"
	          || (!lhs && op == "=" && node != rhs)   // :val("str")
	          || (!lhs && op == "*=" && node.indexOf(rhs) == -1)) { // :contains("substr")
	         return false;
	      }
	   }
	   return true;
	}

	var isArray = Array.isArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	}
	});

	require.define("/node_modules/traverse/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"./index"}});

	require.define("/node_modules/traverse/index.js",function(require,module,exports,__dirname,__filename,process){module.exports = Traverse;
	function Traverse (obj) {
	    if (!(this instanceof Traverse)) return new Traverse(obj);
	    this.value = obj;
	}

	Traverse.prototype.get = function (ps) {
	    var node = this.value;
	    for (var i = 0; i < ps.length; i ++) {
	        var key = ps[i];
	        if (!Object.hasOwnProperty.call(node, key)) {
	            node = undefined;
	            break;
	        }
	        node = node[key];
	    }
	    return node;
	};

	Traverse.prototype.set = function (ps, value) {
	    var node = this.value;
	    for (var i = 0; i < ps.length - 1; i ++) {
	        var key = ps[i];
	        if (!Object.hasOwnProperty.call(node, key)) node[key] = {};
	        node = node[key];
	    }
	    node[ps[i]] = value;
	    return value;
	};

	Traverse.prototype.map = function (cb) {
	    return walk(this.value, cb, true);
	};

	Traverse.prototype.forEach = function (cb) {
	    this.value = walk(this.value, cb, false);
	    return this.value;
	};

	Traverse.prototype.reduce = function (cb, init) {
	    var skip = arguments.length === 1;
	    var acc = skip ? this.value : init;
	    this.forEach(function (x) {
	        if (!this.isRoot || !skip) {
	            acc = cb.call(this, acc, x);
	        }
	    });
	    return acc;
	};

	Traverse.prototype.deepEqual = function (obj) {
	    if (arguments.length !== 1) {
	        throw new Error(
	            'deepEqual requires exactly one object to compare against'
	        );
	    }
    
	    var equal = true;
	    var node = obj;
    
	    this.forEach(function (y) {
	        var notEqual = (function () {
	            equal = false;
	            //this.stop();
	            return undefined;
	        }).bind(this);
        
	        //if (node === undefined || node === null) return notEqual();
        
	        if (!this.isRoot) {
	        /*
	            if (!Object.hasOwnProperty.call(node, this.key)) {
	                return notEqual();
	            }
	        */
	            if (typeof node !== 'object') return notEqual();
	            node = node[this.key];
	        }
        
	        var x = node;
        
	        this.post(function () {
	            node = x;
	        });
        
	        var toS = function (o) {
	            return Object.prototype.toString.call(o);
	        };
        
	        if (this.circular) {
	            if (Traverse(obj).get(this.circular.path) !== x) notEqual();
	        }
	        else if (typeof x !== typeof y) {
	            notEqual();
	        }
	        else if (x === null || y === null || x === undefined || y === undefined) {
	            if (x !== y) notEqual();
	        }
	        else if (x.__proto__ !== y.__proto__) {
	            notEqual();
	        }
	        else if (x === y) {
	            // nop
	        }
	        else if (typeof x === 'function') {
	            if (x instanceof RegExp) {
	                // both regexps on account of the __proto__ check
	                if (x.toString() != y.toString()) notEqual();
	            }
	            else if (x !== y) notEqual();
	        }
	        else if (typeof x === 'object') {
	            if (toS(y) === '[object Arguments]'
	            || toS(x) === '[object Arguments]') {
	                if (toS(x) !== toS(y)) {
	                    notEqual();
	                }
	            }
	            else if (x instanceof Date || y instanceof Date) {
	                if (!(x instanceof Date) || !(y instanceof Date)
	                || x.getTime() !== y.getTime()) {
	                    notEqual();
	                }
	            }
	            else {
	                var kx = Object.keys(x);
	                var ky = Object.keys(y);
	                if (kx.length !== ky.length) return notEqual();
	                for (var i = 0; i < kx.length; i++) {
	                    var k = kx[i];
	                    if (!Object.hasOwnProperty.call(y, k)) {
	                        notEqual();
	                    }
	                }
	            }
	        }
	    });
    
	    return equal;
	};

	Traverse.prototype.paths = function () {
	    var acc = [];
	    this.forEach(function (x) {
	        acc.push(this.path); 
	    });
	    return acc;
	};

	Traverse.prototype.nodes = function () {
	    var acc = [];
	    this.forEach(function (x) {
	        acc.push(this.node);
	    });
	    return acc;
	};

	Traverse.prototype.clone = function () {
	    var parents = [], nodes = [];
    
	    return (function clone (src) {
	        for (var i = 0; i < parents.length; i++) {
	            if (parents[i] === src) {
	                return nodes[i];
	            }
	        }
        
	        if (typeof src === 'object' && src !== null) {
	            var dst = copy(src);
            
	            parents.push(src);
	            nodes.push(dst);
            
	            Object.keys(src).forEach(function (key) {
	                dst[key] = clone(src[key]);
	            });
            
	            parents.pop();
	            nodes.pop();
	            return dst;
	        }
	        else {
	            return src;
	        }
	    })(this.value);
	};

	function walk (root, cb, immutable) {
	    var path = [];
	    var parents = [];
	    var alive = true;
    
	    return (function walker (node_) {
	        var node = immutable ? copy(node_) : node_;
	        var modifiers = {};
        
	        var keepGoing = true;
        
	        var state = {
	            node : node,
	            node_ : node_,
	            path : [].concat(path),
	            parent : parents[parents.length - 1],
	            parents : parents,
	            key : path.slice(-1)[0],
	            isRoot : path.length === 0,
	            level : path.length,
	            circular : null,
	            update : function (x, stopHere) {
	                if (!state.isRoot) {
	                    state.parent.node[state.key] = x;
	                }
	                state.node = x;
	                if (stopHere) keepGoing = false;
	            },
	            'delete' : function () {
	                delete state.parent.node[state.key];
	            },
	            remove : function () {
	                if (Array.isArray(state.parent.node)) {
	                    state.parent.node.splice(state.key, 1);
	                }
	                else {
	                    delete state.parent.node[state.key];
	                }
	            },
	            keys : null,
	            before : function (f) { modifiers.before = f },
	            after : function (f) { modifiers.after = f },
	            pre : function (f) { modifiers.pre = f },
	            post : function (f) { modifiers.post = f },
	            stop : function () { alive = false },
	            block : function () { keepGoing = false }
	        };
        
	        if (!alive) return state;
        
	        if (typeof node === 'object' && node !== null) {
	            state.keys = Object.keys(node);
            
	            state.isLeaf = state.keys.length == 0;
            
	            for (var i = 0; i < parents.length; i++) {
	                if (parents[i].node_ === node_) {
	                    state.circular = parents[i];
	                    break;
	                }
	            }
	        }
	        else {
	            state.isLeaf = true;
	        }
        
	        state.notLeaf = !state.isLeaf;
	        state.notRoot = !state.isRoot;
        
	        // use return values to update if defined
	        var ret = cb.call(state, state.node);
	        if (ret !== undefined && state.update) state.update(ret);
        
	        if (modifiers.before) modifiers.before.call(state, state.node);
        
	        if (!keepGoing) return state;
        
	        if (typeof state.node == 'object'
	        && state.node !== null && !state.circular) {
	            parents.push(state);
            
	            state.keys.forEach(function (key, i) {
	                path.push(key);
                
	                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
	                var child = walker(state.node[key]);
	                if (immutable && Object.hasOwnProperty.call(state.node, key)) {
	                    state.node[key] = child.node;
	                }
                
	                child.isLast = i == state.keys.length - 1;
	                child.isFirst = i == 0;
                
	                if (modifiers.post) modifiers.post.call(state, child);
                
	                path.pop();
	            });
	            parents.pop();
	        }
        
	        if (modifiers.after) modifiers.after.call(state, state.node);
        
	        return state;
	    })(root).node;
	}

	Object.keys(Traverse.prototype).forEach(function (key) {
	    Traverse[key] = function (obj) {
	        var args = [].slice.call(arguments, 1);
	        var t = Traverse(obj);
	        return t[key].apply(t, args);
	    };
	});

	function copy (src) {
	    if (typeof src === 'object' && src !== null) {
	        var dst;
        
	        if (Array.isArray(src)) {
	            dst = [];
	        }
	        else if (src instanceof Date) {
	            dst = new Date(src);
	        }
	        else if (src instanceof Boolean) {
	            dst = new Boolean(src);
	        }
	        else if (src instanceof Number) {
	            dst = new Number(src);
	        }
	        else if (src instanceof String) {
	            dst = new String(src);
	        }
	        else {
	            dst = Object.create(Object.getPrototypeOf(src));
	        }
        
	        Object.keys(src).forEach(function (key) {
	            dst[key] = src[key];
	        });
	        return dst;
	    }
	    else return src;
	}
	});

	require.define("/node_modules/JSONSelect/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"src/jsonselect"}});

	require.define("/node_modules/JSONSelect/src/jsonselect.js",function(require,module,exports,__dirname,__filename,process){/*! Copyright (c) 2011, Lloyd Hilaiel, ISC License */
	/*
	 * This is the JSONSelect reference implementation, in javascript.
	 */
	(function(exports) {

	    var // localize references
	    toString = Object.prototype.toString;

	    function jsonParse(str) {
	      try {
	          if(JSON && JSON.parse){
	              return JSON.parse(str);
	          }
	          return (new Function("return " + str))();
	      } catch(e) {
	        te("ijs", e.message);
	      }
	    }

	    // emitted error codes.
	    var errorCodes = {
	        "bop":  "binary operator expected",
	        "ee":   "expression expected",
	        "epex": "closing paren expected ')'",
	        "ijs":  "invalid json string",
	        "mcp":  "missing closing paren",
	        "mepf": "malformed expression in pseudo-function",
	        "mexp": "multiple expressions not allowed",
	        "mpc":  "multiple pseudo classes (:xxx) not allowed",
	        "nmi":  "multiple ids not allowed",
	        "pex":  "opening paren expected '('",
	        "se":   "selector expected",
	        "sex":  "string expected",
	        "sra":  "string required after '.'",
	        "uc":   "unrecognized char",
	        "ucp":  "unexpected closing paren",
	        "ujs":  "unclosed json string",
	        "upc":  "unrecognized pseudo class"
	    };

	    // throw an error message
	    function te(ec, context) {
	      throw new Error(errorCodes[ec] + ( context && " in '" + context + "'"));
	    }

	    // THE LEXER
	    var toks = {
	        psc: 1, // pseudo class
	        psf: 2, // pseudo class function
	        typ: 3, // type
	        str: 4, // string
	        ide: 5  // identifiers (or "classes", stuff after a dot)
	    };

	    // The primary lexing regular expression in jsonselect
	    var pat = new RegExp(
	        "^(?:" +
	        // (1) whitespace
	        "([\\r\\n\\t\\ ]+)|" +
	        // (2) one-char ops
	        "([~*,>\\)\\(])|" +
	        // (3) types names
	        "(string|boolean|null|array|object|number)|" +
	        // (4) pseudo classes
	        "(:(?:root|first-child|last-child|only-child))|" +
	        // (5) pseudo functions
	        "(:(?:nth-child|nth-last-child|has|expr|val|contains))|" +
	        // (6) bogusly named pseudo something or others
	        "(:\\w+)|" +
	        // (7 & 8) identifiers and JSON strings
	        "(?:(\\.)?(\\\"(?:[^\\\\\\\"]|\\\\[^\\\"])*\\\"))|" +
	        // (8) bogus JSON strings missing a trailing quote
	        "(\\\")|" +
	        // (9) identifiers (unquoted)
	        "\\.((?:[_a-zA-Z]|[^\\0-\\0177]|\\\\[^\\r\\n\\f0-9a-fA-F])(?:[_a-zA-Z0-9\\-]|[^\\u0000-\\u0177]|(?:\\\\[^\\r\\n\\f0-9a-fA-F]))*)" +
	        ")"
	    );

	    // A regular expression for matching "nth expressions" (see grammar, what :nth-child() eats)
	    var nthPat = /^\s*\(\s*(?:([+\-]?)([0-9]*)n\s*(?:([+\-])\s*([0-9]))?|(odd|even)|([+\-]?[0-9]+))\s*\)/;
	    function lex(str, off) {
	        if (!off) off = 0;
	        var m = pat.exec(str.substr(off));
	        if (!m) return undefined;
	        off+=m[0].length;
	        var a;
	        if (m[1]) a = [off, " "];
	        else if (m[2]) a = [off, m[0]];
	        else if (m[3]) a = [off, toks.typ, m[0]];
	        else if (m[4]) a = [off, toks.psc, m[0]];
	        else if (m[5]) a = [off, toks.psf, m[0]];
	        else if (m[6]) te("upc", str);
	        else if (m[8]) a = [off, m[7] ? toks.ide : toks.str, jsonParse(m[8])];
	        else if (m[9]) te("ujs", str);
	        else if (m[10]) a = [off, toks.ide, m[10].replace(/\\([^\r\n\f0-9a-fA-F])/g,"$1")];
	        return a;
	    }

	    // THE EXPRESSION SUBSYSTEM

	    var exprPat = new RegExp(
	            // skip and don't capture leading whitespace
	            "^\\s*(?:" +
	            // (1) simple vals
	            "(true|false|null)|" + 
	            // (2) numbers
	            "(-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)|" +
	            // (3) strings
	            "(\"(?:[^\\]|\\[^\"])*\")|" +
	            // (4) the 'x' value placeholder
	            "(x)|" +
	            // (5) binops
	            "(&&|\\|\\||[\\$\\^<>!\\*]=|[=+\\-*/%<>])|" +
	            // (6) parens
	            "([\\(\\)])" +
	            ")"
	    );

	    function is(o, t) { return typeof o === t; }
	    var operators = {
	        '*':  [ 9, function(lhs, rhs) { return lhs * rhs; } ],
	        '/':  [ 9, function(lhs, rhs) { return lhs / rhs; } ],
	        '%':  [ 9, function(lhs, rhs) { return lhs % rhs; } ],
	        '+':  [ 7, function(lhs, rhs) { return lhs + rhs; } ],
	        '-':  [ 7, function(lhs, rhs) { return lhs - rhs; } ],
	        '<=': [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs <= rhs; } ],
	        '>=': [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs >= rhs; } ],
	        '$=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.lastIndexOf(rhs) === lhs.length - rhs.length; } ],
	        '^=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.indexOf(rhs) === 0; } ],
	        '*=': [ 5, function(lhs, rhs) { return is(lhs, 'string') && is(rhs, 'string') && lhs.indexOf(rhs) !== -1; } ],
	        '>':  [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs > rhs; } ],
	        '<':  [ 5, function(lhs, rhs) { return is(lhs, 'number') && is(rhs, 'number') && lhs < rhs; } ],
	        '=':  [ 3, function(lhs, rhs) { return lhs === rhs; } ],
	        '!=': [ 3, function(lhs, rhs) { return lhs !== rhs; } ],
	        '&&': [ 2, function(lhs, rhs) { return lhs && rhs; } ],
	        '||': [ 1, function(lhs, rhs) { return lhs || rhs; } ]
	    };

	    function exprLex(str, off) {
	        var v, m = exprPat.exec(str.substr(off));
	        if (m) {
	            off += m[0].length;
	            v = m[1] || m[2] || m[3] || m[5] || m[6];
	            if (m[1] || m[2] || m[3]) return [off, 0, jsonParse(v)];
	            else if (m[4]) return [off, 0, undefined];
	            return [off, v];
	        }
	    }

	    function exprParse2(str, off) {
	        if (!off) off = 0;
	        // first we expect a value or a '('
	        var l = exprLex(str, off),
	            lhs;
	        if (l && l[1] === '(') {
	            lhs = exprParse2(str, l[0]);
	            var p = exprLex(str, lhs[0]);
	            if (!p || p[1] !== ')') te('epex', str);
	            off = p[0];
	            lhs = [ '(', lhs[1] ];
	        } else if (!l || (l[1] && l[1] != 'x')) {
	            te("ee", str + " - " + ( l[1] && l[1] ));
	        } else {
	            lhs = ((l[1] === 'x') ? undefined : l[2]);
	            off = l[0];
	        }

	        // now we expect a binary operator or a ')'
	        var op = exprLex(str, off);
	        if (!op || op[1] == ')') return [off, lhs];
	        else if (op[1] == 'x' || !op[1]) {
	            te('bop', str + " - " + ( op[1] && op[1] ));
	        }

	        // tail recursion to fetch the rhs expression
	        var rhs = exprParse2(str, op[0]);
	        off = rhs[0];
	        rhs = rhs[1];

	        // and now precedence!  how shall we put everything together?
	        var v;
	        if (typeof rhs !== 'object' || rhs[0] === '(' || operators[op[1]][0] < operators[rhs[1]][0] ) {
	            v = [lhs, op[1], rhs];
	        }
	        else {
	            v = rhs;
	            while (typeof rhs[0] === 'object' && rhs[0][0] != '(' && operators[op[1]][0] >= operators[rhs[0][1]][0]) {
	                rhs = rhs[0];
	            }
	            rhs[0] = [lhs, op[1], rhs[0]];
	        }
	        return [off, v];
	    }

	    function exprParse(str, off) {
	        function deparen(v) {
	            if (typeof v !== 'object' || v === null) return v;
	            else if (v[0] === '(') return deparen(v[1]);
	            else return [deparen(v[0]), v[1], deparen(v[2])];
	        }
	        var e = exprParse2(str, off ? off : 0);
	        return [e[0], deparen(e[1])];
	    }

	    function exprEval(expr, x) {
	        if (expr === undefined) return x;
	        else if (expr === null || typeof expr !== 'object') {
	            return expr;
	        }
	        var lhs = exprEval(expr[0], x),
	            rhs = exprEval(expr[2], x);
	        return operators[expr[1]][1](lhs, rhs);
	    }

	    // THE PARSER

	    function parse(str, off, nested, hints) {
	        if (!nested) hints = {};

	        var a = [], am, readParen;
	        if (!off) off = 0; 

	        while (true) {
	            var s = parse_selector(str, off, hints);
	            a.push(s[1]);
	            s = lex(str, off = s[0]);
	            if (s && s[1] === " ") s = lex(str, off = s[0]);
	            if (!s) break;
	            // now we've parsed a selector, and have something else...
	            if (s[1] === ">" || s[1] === "~") {
	                if (s[1] === "~") hints.usesSiblingOp = true;
	                a.push(s[1]);
	                off = s[0];
	            } else if (s[1] === ",") {
	                if (am === undefined) am = [ ",", a ];
	                else am.push(a);
	                a = [];
	                off = s[0];
	            } else if (s[1] === ")") {
	                if (!nested) te("ucp", s[1]);
	                readParen = 1;
	                off = s[0];
	                break;
	            }
	        }
	        if (nested && !readParen) te("mcp", str);
	        if (am) am.push(a);
	        var rv;
	        if (!nested && hints.usesSiblingOp) {
	            rv = normalize(am ? am : a);
	        } else {
	            rv = am ? am : a;
	        }
	        return [off, rv];
	    }

	    function normalizeOne(sel) {
	        var sels = [], s;
	        for (var i = 0; i < sel.length; i++) {
	            if (sel[i] === '~') {
	                // `A ~ B` maps to `:has(:root > A) > B`
	                // `Z A ~ B` maps to `Z :has(:root > A) > B, Z:has(:root > A) > B`
	                // This first clause, takes care of the first case, and the first half of the latter case.
	                if (i < 2 || sel[i-2] != '>') {
	                    s = sel.slice(0,i-1);
	                    s = s.concat([{has:[[{pc: ":root"}, ">", sel[i-1]]]}, ">"]);
	                    s = s.concat(sel.slice(i+1));
	                    sels.push(s);
	                }
	                // here we take care of the second half of above:
	                // (`Z A ~ B` maps to `Z :has(:root > A) > B, Z :has(:root > A) > B`)
	                // and a new case:
	                // Z > A ~ B maps to Z:has(:root > A) > B
	                if (i > 1) {
	                    var at = sel[i-2] === '>' ? i-3 : i-2;
	                    s = sel.slice(0,at);
	                    var z = {};
	                    for (var k in sel[at]) if (sel[at].hasOwnProperty(k)) z[k] = sel[at][k];
	                    if (!z.has) z.has = [];
	                    z.has.push([{pc: ":root"}, ">", sel[i-1]]);
	                    s = s.concat(z, '>', sel.slice(i+1));
	                    sels.push(s);
	                }
	                break;
	            }
	        }
	        if (i == sel.length) return sel;
	        return sels.length > 1 ? [','].concat(sels) : sels[0];
	    }

	    function normalize(sels) {
	        if (sels[0] === ',') {
	            var r = [","];
	            for (var i = i; i < sels.length; i++) {
	                var s = normalizeOne(s[i]);
	                r = r.concat(s[0] === "," ? s.slice(1) : s);
	            }
	            return r;
	        } else {
	            return normalizeOne(sels);
	        }
	    }

	    function parse_selector(str, off, hints) {
	        var soff = off;
	        var s = { };
	        var l = lex(str, off);
	        // skip space
	        if (l && l[1] === " ") { soff = off = l[0]; l = lex(str, off); }
	        if (l && l[1] === toks.typ) {
	            s.type = l[2];
	            l = lex(str, (off = l[0]));
	        } else if (l && l[1] === "*") {
	            // don't bother representing the universal sel, '*' in the
	            // parse tree, cause it's the default
	            l = lex(str, (off = l[0]));
	        }

	        // now support either an id or a pc
	        while (true) {
	            if (l === undefined) {
	                break;
	            } else if (l[1] === toks.ide) {
	                if (s.id) te("nmi", l[1]);
	                s.id = l[2];
	            } else if (l[1] === toks.psc) {
	                if (s.pc || s.pf) te("mpc", l[1]);
	                // collapse first-child and last-child into nth-child expressions
	                if (l[2] === ":first-child") {
	                    s.pf = ":nth-child";
	                    s.a = 0;
	                    s.b = 1;
	                } else if (l[2] === ":last-child") {
	                    s.pf = ":nth-last-child";
	                    s.a = 0;
	                    s.b = 1;
	                } else {
	                    s.pc = l[2];
	                }
	            } else if (l[1] === toks.psf) {
	                if (l[2] === ":val" || l[2] === ":contains") {
	                    s.expr = [ undefined, l[2] === ":val" ? "=" : "*=", undefined];
	                    // any amount of whitespace, followed by paren, string, paren
	                    l = lex(str, (off = l[0]));
	                    if (l && l[1] === " ") l = lex(str, off = l[0]);
	                    if (!l || l[1] !== "(") te("pex", str);
	                    l = lex(str, (off = l[0]));
	                    if (l && l[1] === " ") l = lex(str, off = l[0]);
	                    if (!l || l[1] !== toks.str) te("sex", str);
	                    s.expr[2] = l[2];
	                    l = lex(str, (off = l[0]));
	                    if (l && l[1] === " ") l = lex(str, off = l[0]);
	                    if (!l || l[1] !== ")") te("epex", str);
	                } else if (l[2] === ":has") {
	                    // any amount of whitespace, followed by paren
	                    l = lex(str, (off = l[0]));
	                    if (l && l[1] === " ") l = lex(str, off = l[0]);
	                    if (!l || l[1] !== "(") te("pex", str);
	                    var h = parse(str, l[0], true);
	                    l[0] = h[0];
	                    if (!s.has) s.has = [];
	                    s.has.push(h[1]);
	                } else if (l[2] === ":expr") {
	                    if (s.expr) te("mexp", str);
	                    var e = exprParse(str, l[0]);
	                    l[0] = e[0];
	                    s.expr = e[1];
	                } else {
	                    if (s.pc || s.pf ) te("mpc", str);
	                    s.pf = l[2];
	                    var m = nthPat.exec(str.substr(l[0]));
	                    if (!m) te("mepf", str);
	                    if (m[5]) {
	                        s.a = 2;
	                        s.b = (m[5] === "odd") ? 1 : 0;
	                    } else if (m[6]) {
	                        s.a = 0;
	                        s.b = parseInt(m[6], 10);
	                    } else {
	                        s.a = parseInt((m[1] ? m[1] : "+") + (m[2] ? m[2] : "1"),10);
	                        s.b = m[3] ? parseInt(m[3] + m[4],10) : 0;
	                    }
	                    l[0] += m[0].length;
	                }
	            } else {
	                break;
	            }
	            l = lex(str, (off = l[0]));
	        }

	        // now if we didn't actually parse anything it's an error
	        if (soff === off) te("se", str);

	        return [off, s];
	    }

	    // THE EVALUATOR

	    function isArray(o) {
	        return Array.isArray ? Array.isArray(o) : 
	          toString.call(o) === "[object Array]";
	    }

	    function mytypeof(o) {
	        if (o === null) return "null";
	        var to = typeof o;
	        if (to === "object" && isArray(o)) to = "array";
	        return to;
	    }

	    function mn(node, sel, id, num, tot) {
	        var sels = [];
	        var cs = (sel[0] === ">") ? sel[1] : sel[0];
	        var m = true, mod;
	        if (cs.type) m = m && (cs.type === mytypeof(node));
	        if (cs.id)   m = m && (cs.id === id);
	        if (m && cs.pf) {
	            if (cs.pf === ":nth-last-child") num = tot - num;
	            else num++;
	            if (cs.a === 0) {
	                m = cs.b === num;
	            } else {
	                mod = ((num - cs.b) % cs.a);

	                m = (!mod && ((num*cs.a + cs.b) >= 0));
	            }
	        }
	        if (m && cs.has) {
	            // perhaps we should augment forEach to handle a return value
	            // that indicates "client cancels traversal"?
	            var bail = function() { throw 42; };
	            for (var i = 0; i < cs.has.length; i++) {
	                try {
	                    forEach(cs.has[i], node, bail);
	                } catch (e) {
	                    if (e === 42) continue;
	                }
	                m = false;
	                break;
	            }
	        }
	        if (m && cs.expr) {
	            m = exprEval(cs.expr, node);
	        }
	        // should we repeat this selector for descendants?
	        if (sel[0] !== ">" && sel[0].pc !== ":root") sels.push(sel);

	        if (m) {
	            // is there a fragment that we should pass down?
	            if (sel[0] === ">") { if (sel.length > 2) { m = false; sels.push(sel.slice(2)); } }
	            else if (sel.length > 1) { m = false; sels.push(sel.slice(1)); }
	        }

	        return [m, sels];
	    }

	    function forEach(sel, obj, fun, id, num, tot) {
	        var a = (sel[0] === ",") ? sel.slice(1) : [sel],
	        a0 = [],
	        call = false,
	        i = 0, j = 0, k, x;
	        for (i = 0; i < a.length; i++) {
	            x = mn(obj, a[i], id, num, tot);
	            if (x[0]) {
	                call = true;
	            }
	            for (j = 0; j < x[1].length; j++) {
	                a0.push(x[1][j]);
	            }
	        }
	        if (a0.length && typeof obj === "object") {
	            if (a0.length >= 1) {
	                a0.unshift(",");
	            }
	            if (isArray(obj)) {
	                for (i = 0; i < obj.length; i++) {
	                    forEach(a0, obj[i], fun, undefined, i, obj.length);
	                }
	            } else {
	                for (k in obj) {
	                    if (obj.hasOwnProperty(k)) {
	                        forEach(a0, obj[k], fun, k);
	                    }
	                }
	            }
	        }
	        if (call && fun) {
	            fun(obj);
	        }
	    }

	    function match(sel, obj) {
	        var a = [];
	        forEach(sel, obj, function(x) {
	            a.push(x);
	        });
	        return a;
	    }

	    function compile(sel) {
	        return {
	            sel: parse(sel)[1],
	            match: function(obj){
	                return match(this.sel, obj);
	            },
	            forEach: function(obj, fun) {
	                return forEach(this.sel, obj, fun);
	            }
	        };
	    }

	    exports._lex = lex;
	    exports._parse = parse;
	    exports.match = function (sel, obj) {
	        return compile(sel).match(obj);
	    };
	    exports.forEach = function(sel, obj, fun) {
	        return compile(sel).forEach(obj, fun);
	    };
	    exports.compile = compile;
	})(typeof exports === "undefined" ? (window.JSONSelect = {}) : exports);
	});
	
	return require('js-select');
})();