import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"

const Tweet = () => {
	const [tweet, setTweet] = useState({});
	const [user, setUser] = useState({});
	const [currentUser, setCurrentUser] = useState({});
	const [like, setLike] = useState([])
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
			// ユーザー情報
			let tweet_user_info_api_url = "http://localhost:3002/users/" + response["data"]["tweet"]["user_id"]
			axios({
				method: "GET",
				url: tweet_user_info_api_url
			}).then((response1) => {
				setUser(response1["data"]["user"]);
			})
			// サインインユーザー情報
			let signed_in_user_api_url = "http://localhost:3002/signed_in_user"
			axios({
				method: "GET",
				url: signed_in_user_api_url,
				withCredentials: true
			}).then((response2) => {
				// 書き方が渋い
				if ( response2["data"]["user"] != undefined ){
					setCurrentUser(response2["data"]["user"])
				} else {
					setCurrentUser({"id":0})
				}
				console.log(response2["data"]["user"])
				// いいね
				let like_api_url = "http://localhost:3002/tweets/" + response["data"]["tweet"]["id"] + "/like"
				axios({
					method: "GET",
					url: like_api_url
				}).then((response3) => {
					setLike(response3["data"]["users"])
					let user_like = []
					response3["data"]["users"].forEach(function(item){
						user_like.push(item["id"])
					})
					if ( user_like.includes(response2["data"]["user"]["id"]) == false ) {
						console.log("hide like", user_like, currentUser["id"])
						document.getElementsByClassName("like-section")[0].classList.add("hidden-like");
						// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
						document.getElementsByClassName("like-length")[0].innerText = user_like.length
						document.getElementsByClassName("no-like-length")[0].innerText = user_like.length
					} else if ( user_like.includes(response2["data"]["user"]["id"]) == true ) {
						console.log("hide no like", user_like, currentUser["id"])
						document.getElementsByClassName("no-like-section")[0].classList.add("hidden-like");
						// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
						document.getElementsByClassName("like-length")[0].innerText = user_like.length
						document.getElementsByClassName("no-like-length")[0].innerText = user_like.length
					}
				})
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

	const like_post = (tweet_id) => {
		document.getElementsByClassName("like-section")[0].classList.remove("hidden-like")
		document.getElementsByClassName("no-like-section")[0].classList.add("hidden-like")
		axios({
			method: "POST",
			url: "http://localhost:3002/tweets/" + tweet_id + "/like",
			withCredentials: true
		})
		get_current_like_status(tweet_id)
	}

	const cancel_like_post = (tweet_id) => {
		document.getElementsByClassName("like-section")[0].classList.add("hidden-like")
		document.getElementsByClassName("no-like-section")[0].classList.remove("hidden-like")
		axios({
			method: "POST",
			url: "http://localhost:3002/tweets/" + tweet_id + "/unlike",
			withCredentials: true
		})
		get_current_like_status(tweet_id)
	}

	const get_current_like_status = (tweet_id) => {
		let current_like_url = "http://localhost:3002/tweets/" + tweet_id + "/like"
		axios({
			method: "GET",
			url: current_like_url
		}).then((response) => {
			let user_count = response["data"]["users"].length
			document.getElementsByClassName("like-length")[0].innerText = user_count;
			document.getElementsByClassName("no-like-length")[0].innerText = user_count;
		})
	}

	return(
		<div>
			<Link to="/tweets" className="btn">ツイートタイムラインに戻る</Link>
			<div className="tweetcard">
				<div className="tweetcard-title row">
					<div class="col-2">
						{ user["avatar_image_url"] == "" &&
							<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img-big" />
						}
						{ user["avatar_image_url"] != "" &&
							<img src={user["avatar_image_url"]} className="user-avatar-img-big" />
						}
					</div>
					<div class="col-10">
						<Link to={'/users/'+user.id}>
							{user.lastname} {user.firstname}
						</Link>
						<div className="tweetcard-content">
							<h5>
								{tweet.content}
							</h5>
							{tweet.created_at}
							<br />
							<div className="tweetcard-like-content">
								<div className="like-section">
									<div className="like-row">
										<img src={heart_normal} className="like-img" onClick={()=>cancel_like_post(tweet.id)} />
										<span className="like-length">0</span>
									</div>
								</div>
								<div className="no-like-section">
									<div className="like-row">
										<img src={heart_dark} className="no-like-img" onClick={()=>like_post(tweet.id)} />
										<span className="no-like-length">0</span>
									</div>
								</div>
							</div>
							{currentUser["id"] == tweet["user_id"] &&
								<button className="btn btn-sm btn-danger" onClick={delete_tweet}>ツイートを削除する</button>
							}
						</div>
					</div>
					<hr />
				</div>
			</div>
		</div>
	)
}

export default Tweet;