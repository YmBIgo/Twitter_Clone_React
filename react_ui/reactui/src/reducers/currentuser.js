import {GET_CURRENT_USER_SUCCESS,GET_CURRENT_USER_FAIL, GET_CURRENT_USER_DATA} from "../actions"

const currentuser = (state={}, action) => {
	//
	switch(action.type){
		case GET_CURRENT_USER_SUCCESS:
			return action.currentuser
		case GET_CURRENT_USER_FAIL:
			return {}
		case GET_CURRENT_USER_DATA:
			return state
		default:
			return state
	}
}

export default currentuser