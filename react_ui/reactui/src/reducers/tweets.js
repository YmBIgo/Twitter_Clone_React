import {GET_TWEET_SUCCESS, GET_TWEET_FAIL} from "../actions"
const initialState = []

const tweets = (state=initialState, action) => {
	switch(action.type) {
		case GET_TWEET_SUCCESS:
			return action.tweets
		case GET_TWEET_FAIL:
			return []
		default:
			return state
	}
}

export default tweets