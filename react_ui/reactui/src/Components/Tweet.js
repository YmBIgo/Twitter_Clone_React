import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import "./CSS/Tweets.css"

const Tweet = () => {
	const [tweet, setTweet] = useState({});
	const [user, setUser] = useState({});
	const [currentUser, setCurrentUser] = useState({});
	const useeffect_counter = 0;
	const query = useParams();

	useEffect(() => { 
		display_tweet();
	}, [useeffect_counter])

	const display_tweet = () => {
		let tweet_api_url = "http://localhost:3002/tweets/" + query.id
		axios({
			method: "GET",
			url: tweet_api_url
		}).then((response) => {
			console.log(response["data"]["tweet"])
			setTweet(response["data"]["tweet"])
			let tweet_user_info_api_url = "http://localhost:3002/users/" + response["data"]["tweet"]["user_id"]
			axios({
				method: "GET",
				url: tweet_user_info_api_url
			}).then((response) => {
				setUser(response["data"]["user"]);
			})
			let signed_in_user_api_url = "http://localhost:3002/signed_in_user"
			axios({
				method: "GET",
				url: signed_in_user_api_url,
				withCredentials: true
			}).then((response) => {
				setCurrentUser(response["data"]["user"])
				console.log(response["data"]["user"])
			})
		})
	}

	const delete_tweet = () => {
		if (window.confirm('本当に削除していいんですね？')){
			let tweet_delete_api_url = "http://localhost:3002/tweets/delete/" + tweet.id
			console.log(tweet_delete_api_url)
			axios({
				method: "POST",
				url: tweet_delete_api_url,
				withCredentials: true
			}).then((response) => {
				console.log(response)
				window.location.assign("http://localhost:3000/tweets")
			})
		} else {
			console.log("削除キャンセル")
		}
	}

	return(
		<div>
			<Link to="/tweets" className="btn">ツイート一覧に戻る</Link>
			<div className="tweetcard">
				<div className="tweetcard-title">{tweet.id} : {user.lastname} {user.firstname}</div>
				<div className="tweetcard-content">
					{tweet.content}
					<br />
					{ currentUser["id"] == tweet["user_id"] &&
						<button className="btn btn-sm btn-danger" onClick={delete_tweet}>ツイートを削除する</button>
					}
				</div>
			</div>
		</div>
	)
}

export default Tweet;