import {combineReducers} from "redux"
import tweets from "./tweets"
import currentuser from "./currentuser"

const reducer = combineReducers({
	tweets,
	currentuser
});

export default reducer