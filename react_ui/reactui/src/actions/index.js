import axios from "axios"

// Get Tweets
export const GET_TWEET_SUCCESS = "GET_TWEET_SUCCESS"
export const GET_TWEET_FAIL = "GET_TWEET_FAIL"
// Concat Tweets
export const CONCAT_TWEET_SUCCESS = "CONCAT_TWEET_SUCCESS"
export const CONCAT_TWEET_FAIL = "CONCAT_TWEET_FAIL"
// Get Current User
export const GET_CURRENT_USER_SUCCESS = "GET_CURRENT_USER_SUCCESS"
export const GET_CURRENT_USER_FAIL = "GET_CURRENT_USER_FAIL"
export const GET_CURRENT_USER_DATA = "GET_CURRENT_USER_DATA"
// Search Modal Page
export const CHANGE_SEARCH_MODAL_PAGE = "CHANGE_SEARCH_MODAL_PAGE"

// Tweets
export const getTweet = () => {

	return (dispatch) => {
		axios({
			method: "GET",
			url: "http://localhost:3002/tweets",
			withCredentials: true
		}).then((response) => {
			let res_status = response["data"]["status"]
			if (res_status === "ok"){
					// tweets 取得 dispatch
				let res_tweets = response["data"]["tweets"]
				dispatch(getTweetSuccess(res_tweets))
			} else if (res_status === "authentification error"){
				dispatch(getTweetFail("auth error"))
			} else if (res_status === "error") {
				dispatch(getTweetFail("error"))
			} else {
				//
			}
		}).catch((err) => {
			dispatch(getTweetFail(err))
		})
	}
}

export const concatTweet = (offset) => {
	return (dispatch) => {
		axios({
			method: "GET",
			url: "http://localhost:3002/tweets?offset=" + offset.toString(),
			withCredentials: true
		}).then((response) => {
			let res_status = response["data"]["status"]
			if (res_status === "ok"){
					// tweets 取得 dispatch
				let res_tweets = response["data"]["tweets"]
				dispatch(concatTweetSuccess(res_tweets))
			} else if (res_status === "authentification error"){
				dispatch(concatTweetFail("auth error"))
			} else if (res_status === "error") {
				dispatch(concatTweetFail("error"))
			} else {
				//
			}
		}).catch((err) => {
			dispatch(concatTweetFail(err))
		})
	}
}

const getTweetSuccess = tweets => {
	return {
		type: GET_TWEET_SUCCESS,
		tweets: tweets,
	}
}

const getTweetFail = (error) => {
	return {
		type: GET_TWEET_FAIL,
		error: error,
	}
}

const concatTweetSuccess = tweets => {
	return {
		type: CONCAT_TWEET_SUCCESS,
		tweets: tweets
	}
}

const concatTweetFail = tweets => {
	return {
		type: CONCAT_TWEET_FAIL,
		tweets: tweets
	}
}

// Current User
export const getCurrentUser = () => {
	return (dispatch) => {
		axios({
			method: "GET",
			url: "http://localhost:3002/signed_in_user",
			withCredentials: true
		}).then((response) => {
			let res_status = response["data"]["status"]
			if (res_status == "ok") {
				dispatch(getCurrentUserSuccess(response["data"]["user"]))
			} else if (res_status == "user not signed in error") {
				dispatch(getCurrentUserFail("user not signed in error"))
			}
		}).catch((err) => {
			dispatch(getCurrentUserFail(err))
		})
	}
}

const getCurrentUserSuccess = currentuser => {
	return{
		type: GET_CURRENT_USER_SUCCESS,
		currentuser: currentuser
	}
}

const getCurrentUserFail = (error) => {
	return {
		type: GET_CURRENT_USER_FAIL,
		error: error,
	}
}

export const getCurrentUserData = () => {
	return {
		type: GET_CURRENT_USER_DATA
	}
}

// Search Modal
export const ChangeSearchModalPage = (page_id) => {
	return {
		type: CHANGE_SEARCH_MODAL_PAGE,
		page_id: page_id
	}
}

