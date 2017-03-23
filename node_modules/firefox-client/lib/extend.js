module.exports = function extend(prototype, properties) {
  return Object.create(prototype, getOwnPropertyDescriptors(properties));
}

function getOwnPropertyDescriptors(object) {
  var names = Object.getOwnPropertyNames(object);

  return names.reduce(function(descriptor, name) {
    descriptor[name] = Object.getOwnPropertyDescriptor(object, name);
    return descriptor;
  }, {});
}