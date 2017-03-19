import reducer from './reducer'
import * as actions from './actions'
import * as epics from './epics'
import Overview from './components/Overview'
import Main from './components/Main'

export default {reducer, actions, epics, components: { Overview, Main }}
