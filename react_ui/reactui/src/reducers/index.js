import {combineReducers} from "redux"
import tweets from "./tweets"
import currentuser from "./currentuser"
import searchPages from "./searchPage"

const reducer = combineReducers({
	tweets,
	currentuser,
	searchPages
});

export default reducer