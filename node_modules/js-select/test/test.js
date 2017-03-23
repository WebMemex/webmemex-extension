var assert = require("assert"),
    fs = require("fs"),
    traverse = require("traverse")
    select = require("../index");

var people = {
   "george": {
       age : 35,
       movies: [{
          name: "Repo Man",
          stars: 5
      }]
   },
   "mary": {
       age: 15,
       movies: [{
           name: "Twilight",
           stars: 3
       },
       {
          name: "Trudy",
          stars: 2
       },
       {
          name: "The Fighter",
          stars: 4
       }]
   },
   "chris" : {
      car: null,
      male: true
   }
};

var people2, obj;

assert.deepEqual(select(people, "*").nodes(), [{"george":{"age":35,"movies":[{"name":"Repo Man","stars":5}]},"mary":{"age":15,"movies":[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]},"chris":{"car":null,"male":true}},{"age":35,"movies":[{"name":"Repo Man","stars":5}]},35,[{"name":"Repo Man","stars":5}],{"name":"Repo Man","stars":5},"Repo Man",5,{"age":15,"movies":[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]},15,[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}],{"name":"Twilight","stars":3},"Twilight",3,{"name":"Trudy","stars":2},"Trudy",2,{"name":"The Fighter","stars":4},"The Fighter",4,{"car":null,"male":true},null,true]);
assert.deepEqual(select(people, ".george").nodes(), [{"age":35,"movies":[{"name":"Repo Man","stars":5}]}]);
assert.deepEqual(select(people, ".george .age").nodes(), [35]);
assert.deepEqual(select(people, ".george .name").nodes(), ["Repo Man"]);
assert.deepEqual(select(people, ".george *").nodes(), [35,[{"name":"Repo Man","stars":5}],{"name":"Repo Man","stars":5},"Repo Man",5])

assert.deepEqual(select(people, ".george > *").nodes(), [35,[{"name":"Repo Man","stars":5}]]);
assert.deepEqual(select(people, ".george > .name").nodes(), []);

assert.deepEqual(select(people, ":first-child").nodes(), [{"name":"Repo Man","stars":5},{"name":"Twilight","stars":3}]);
assert.deepEqual(select(people, ":nth-child(1)").nodes(), select(people, ":first-child").nodes());
assert.deepEqual(select(people, ":nth-child(2)").nodes(), [{"name":"Trudy","stars":2}]);
assert.deepEqual(select(people, ":nth-child(odd)").nodes(), [{"name":"Repo Man","stars":5},{"name":"Twilight","stars":3},{"name":"The Fighter","stars":4}]);
assert.deepEqual(select(people, ":nth-child(even)").nodes(), [{"name":"Trudy","stars":2}]);

assert.deepEqual(select(people, ":nth-child(-n+1)").nodes(), select(people, ":first-child").nodes());
assert.deepEqual(select(people, ":nth-child(-n+2)").nodes(), [{"name":"Repo Man","stars":5},{"name":"Twilight","stars":3},{"name":"Trudy","stars":2}]);
assert.deepEqual(select(people, ":nth-child(n)").nodes(), [{"name":"Repo Man","stars":5},{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]);
assert.deepEqual(select(people, ":nth-child(n-1)").nodes(), select(people, ":nth-child(n)").nodes());
assert.deepEqual(select(people, ":nth-child(n-2)").nodes(), [{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]);

assert.deepEqual(select(people, ":last-child").nodes(), [{"name":"Repo Man","stars":5},{"name":"The Fighter","stars":4}]);
assert.deepEqual(select(people, ":nth-last-child(1)").nodes(), select(people, ":last-child").nodes());
assert.deepEqual(select(people, ":nth-last-child(2)").nodes(), [{"name":"Trudy","stars":2}]);
assert.deepEqual(select(people, ":only-child").nodes(), [{"name":"Repo Man","stars":5}]);
assert.deepEqual(select(people, ":root").nodes(),[{"george":{"age":35,"movies":[{"name":"Repo Man","stars":5}]},"mary":{"age":15,"movies":[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]},"chris":{"car":null,"male":true}}])

assert.deepEqual(select(people, "string").nodes(),["Repo Man","Twilight","Trudy","The Fighter"]);
assert.deepEqual(select(people, "number").nodes(),[35,5,15,3,2,4]);
assert.deepEqual(select(people, "boolean").nodes(),[true]);
assert.deepEqual(select(people, "object").nodes(),[{"george":{"age":35,"movies":[{"name":"Repo Man","stars":5}]},"mary":{"age":15,"movies":[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]},"chris":{"car":null,"male":true}},{"age":35,"movies":[{"name":"Repo Man","stars":5}]},{"name":"Repo Man","stars":5},{"age":15,"movies":[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]},{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4},{"car":null,"male":true}]);
assert.deepEqual(select(people, "array").nodes(),[[{"name":"Repo Man","stars":5}],[{"name":"Twilight","stars":3},{"name":"Trudy","stars":2},{"name":"The Fighter","stars":4}]]);
assert.deepEqual(select(people, "null").nodes(),[null]);

assert.deepEqual(select(people, "number, string, boolean").nodes(), [35,"Repo Man",5,15,"Twilight",3,"Trudy",2,"The Fighter",4,true])

assert.deepEqual(select(people, ":has(.car) > .male").nodes(), [true]);
assert.deepEqual(select(people, ".male ~ .car").nodes(), [null])

assert.deepEqual(select(people, ':val("Twilight")').nodes(), ["Twilight"])
assert.deepEqual(select(people, ':val("Twi")').nodes(), [])
assert.deepEqual(select(people, ':contains("Twi")').nodes(), ["Twilight"])
assert.deepEqual(select(people, ':contains("weif")').nodes(), [])

// invalid
assert.deepEqual(select(people, ".hmmm").nodes(), []);
assert.throws(function() {
   select(people, "afcjwiojwe9q28*C@!(# (!#R($R)))").nodes();
});

// update()
people2 = traverse.clone(people);

select(people2, ".age").update(function(age) {
    return age - 5;
})
assert.deepEqual(select(people2, ".age").nodes(), [30, 10]);

obj = select(people2, ".age").update(3)
assert.deepEqual(select(people2, ".age").nodes(), [3, 3]);
assert.deepEqual(obj, people2);

// remove()
people2 = traverse.clone(people);

obj = select(people2, ".age").remove();
assert.deepEqual(select(people2, ".age").nodes(), []);
assert.deepEqual(obj, people2);

// condense()
people2 = traverse.clone(people);
select(people2, ".george").condense();
assert.deepEqual(people2, {"george": {age: 35, movies: [{name: "Repo Man", stars: 5}]}});

people2 = traverse.clone(people);
select(people2, ".hmmm").condense();
assert.deepEqual(people2, {});

people2 = traverse.clone(people);
obj = select(people2, ".stars").condense();
assert.deepEqual(people2, {"george": {movies: [{stars: 5}]}, "mary": {movies: [{stars: 3},{stars: 2},{stars: 4}]}});
assert.deepEqual(obj, people2);

// forEach()
people2 = traverse.clone(people);

obj = select(people2, ".age").forEach(function(age) {
    this.update(age - 5);
})
assert.deepEqual(select(people2, ".age").nodes(), [30, 10]);
assert.deepEqual(obj, people2);


// this.matches()
people2 = traverse.clone(people);
select(people2).forEach(function(node) {
   if (this.matches(".age")) {
      this.update(node + 10);
   }
});
assert.deepEqual(select(people2, ".age").nodes(), [45, 25])


// bigger stuff
var timeline = require("./timeline.js");

console.time("select time");
assert.equal(select(timeline, ".bug .id").nodes().length, 126);
assert.equal(select(timeline, ".id").nodes().length, 141);
assert.equal(select(timeline, ".comments .id").nodes().length, 115);
assert.equal(select(timeline, ":nth-child(n-2)").nodes().length, 335);
assert.equal(select(timeline, "object").nodes().length, 927);
assert.equal(select(timeline, "*").nodes().length, 3281);
console.timeEnd("select time")

var sel = require("JSONSelect");

console.time("JSONSelect time")
assert.equal(sel.match(".bug .id", timeline).length, 126);
assert.equal(sel.match(".id", timeline).length, 141);
assert.equal(sel.match(".comments .id", timeline).length, 115);
assert.equal(sel.match(":nth-child(n-2)", timeline).length, 335);
assert.equal(sel.match("object", timeline).length, 927);
assert.equal(sel.match("*", timeline).length, 3281);
console.timeEnd("JSONSelect time")
