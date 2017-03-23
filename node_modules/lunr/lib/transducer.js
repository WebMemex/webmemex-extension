lunr.Transducer = function () {
  lunr.Transducer.id++
  this.id = lunr.Transducer.id
  this.final = false
  this.edges = {}
  this.count = 0
}

lunr.Transducer.id = 0

lunr.Transducer.prototype.toString = function () {
  var arr = []

  if (this.final) {
    arr.push("1")
  } else {
    arr.push("0")
  }

  for (var label in this.edges) {
    var node = this.edges[label]
    arr.push(label)
    arr.push(node.toString())
  }

  return arr.join("-")
}

lunr.Transducer.prototype.numReachable = function () {
}

lunr.TransducerBuilder = function () {
  this.minimizedNodes = {}
}

lunr.TransducerBuilder.prototype.add = function (word, index) {
  // calculate longest common prefix
  // minimize states from the suffix of the previous word
  // initialize tail states for the current word

  if (word < this.previousWord) {
    throw "out of order word insertion"
  }

  var commonPrefix = 0
  for (var i = 0; i < word.length && i < this.previousWord.length; i++) {
    if (word[i] != this.previousWord[i]) break
    commonPrefix += 1
  }

  this.minimize(commonPrefix)

}
