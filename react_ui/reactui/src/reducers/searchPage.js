import {CHANGE_SEARCH_MODAL_PAGE} from "../actions"

const searchPages = (state = 0, action) => {
	switch(action.type) {
		case CHANGE_SEARCH_MODAL_PAGE:
			return action.page_id
		default:
			return state
	}
}

export default searchPages;