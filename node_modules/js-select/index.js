var traverse = require("traverse"),
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
         return obj;
      },

      remove: function() {
         this.forEach(function(node) {
            this.remove();
         })
         return obj;
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
         return obj;
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
         return obj;
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
