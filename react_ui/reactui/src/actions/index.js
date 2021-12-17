import axios from "axios"
export const GET_TWEET_SUCCESS = "GET_TWEET_SUCCESS"
export const GET_TWEET_FAIL = "GET_TWEET_FAIL"

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