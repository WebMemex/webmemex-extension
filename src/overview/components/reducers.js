var {combineReducers} = require('redux')
var {reducer: formReducer} = require('redux-form')

module.exports = combineReducers({
  form: formReducer
})