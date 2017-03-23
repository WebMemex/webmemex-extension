/* node runner for the JSONSelect conformance tests
   https://github.com/lloyd/JSONSelectTests */

var assert = require("assert"),
    fs = require("fs"),
    path = require("path"),
    colors = require("colors"),
    traverse = require("traverse")
    select = require("../index");

var options = require("nomnom").opts({
   directory: {
      abbr: 'd',
      help: 'directory of tests to run',
      metavar: 'PATH',
      default: __dirname + "/level_1"
   }
}).parseArgs();

var directory = options.directory,
    files = fs.readdirSync(directory);

var jsonFiles = files.filter(function(file) {
   return path.extname(file) == ".json";
});

jsonFiles.forEach(function(file) {
   var jsonName = file.replace(/\..*$/, ""),
       json = JSON.parse(fs.readFileSync(path.join(directory, file), "utf-8"));
   
   var selFiles = files.filter(function(file) {
      return file.indexOf(jsonName) == 0 && path.extname(file) == ".selector"
   })
   
   selFiles.forEach(function(file) {
      var test = file.replace(/\..*$/, "");
      var selector = fs.readFileSync(path.join(directory, file), "utf-8");
      var output = fs.readFileSync(path.join(directory, test + ".output"), "utf-8");
      
      var expected = JSON.parse(output).sort(sort);
      var got = select(json, selector).nodes().sort(sort);
      try {
          assert.deepEqual(got, expected);
      }
      catch(AssertionError) {
         console.log("\nfail".red + " " + test + "\ngot: ".blue + JSON.stringify(got)
            + "\n\expected: ".blue + JSON.stringify(expected) + "\n")
      };
      console.log("pass".green + " " + test);
   });
});

function sort(a, b) {
   if (JSON.stringify(a) < JSON.stringify(b)) {
      return -1;      
   }
   return 1;
}
