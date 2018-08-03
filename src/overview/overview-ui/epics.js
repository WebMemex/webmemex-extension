import { debounceTime, filter, map } from 'rxjs/operators'

import * as actions from './actions'


const searchUpdateActions = [
    actions.setQuery.getType(),
    actions.setStartDate.getType(),
    actions.setEndDate.getType(),
]

// When the query changed, refresh the search results
export const refreshSearchResultsUponQueryChange = action$ => action$.pipe(
    filter(action => searchUpdateActions.includes(action.type)),
    debounceTime(500), // wait until typing stops for 500ms
    map(() => actions.updateSearch()),
)
