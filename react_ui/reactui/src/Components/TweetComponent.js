import React, { useState, useEffect } from "react"
import axios from "axios";
import { Link } from "react-router-dom"
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"
import reply_normal from "./IMG/reply.png"
import retweet_normal from "./IMG/retweet_normal.jpeg"
import retweet_dark from "./IMG/retweet_dark.svg"

const TweetComponent = (props) => {

	const [tweet, setTweet] = useState({});
	const [user, setUser] = useState({});
	const [retweetUser, setRetweetUser] = useState({});
	const [retweetID, setRetweetID] = useState(0);
	const [currentUser, setCurrentUser] = useState({});
	const [like, setLike] = useState([])
	const useeffect_counter = 0;

	useEffect(() => {
		get_tweet_data()
	}, [useeffect_counter])

	const get_tweet_data = () => {
		let tweet_api_url = "http://localhost:3002/tweets/" + props.tweet_id
		axios({
			method: "GET",
			url: tweet_api_url
		}).then((response) => {
			setTweet(response["data"]["tweet"])
			// ユーザー情報
			let tweet_user_info_api_url = "";
			if ( response["data"]["tweet"]["is_retweet"] == 0 ) {
				tweet_user_info_api_url = "http://localhost:3002/users/" + response["data"]["tweet"]["user_id"]
				axios({
					method: "GET",
					url: tweet_user_info_api_url
				}).then((response1) => {
					setUser(response1["data"]["user"]);
				})
			} else {
				axios({
					method: "GET",
					url: "http://localhost:3002/tweets/" + response["data"]["tweet"]["is_retweet"]
				}).then((tw_response) => {
					tweet_user_info_api_url = "http://localhost:3002/users/" + tw_response["data"]["tweet"]["user_id"]
					axios({
						method: "GET",
						url: "http://localhost:3002/users/" + response["data"]["tweet"]["user_id"]
					}).then((retweet_response) => {
						setRetweetUser(retweet_response["data"]["user"])
					})
					axios({
						method: "GET",
						url: tweet_user_info_api_url
					}).then((response1) => {
						setUser(response1["data"]["user"]);
					})
				})
				console.log(tweet_user_info_api_url)
			}
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
						document.getElementsByClassName("like-section")[props.t_index].classList.add("hidden-like");
						// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
						document.getElementsByClassName("like-length")[props.t_index].innerText = user_like.length + "Likes";
						document.getElementsByClassName("no-like-length")[props.t_index].innerText = user_like.length + "Likes";
					} else if ( user_like.includes(response2["data"]["user"]["id"]) == true ) {
						document.getElementsByClassName("no-like-section")[props.t_index].classList.add("hidden-like");
						// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
						document.getElementsByClassName("like-length")[props.t_index].innerText = user_like.length + "Likes";
						document.getElementsByClassName("no-like-length")[props.t_index].innerText = user_like.length + "Likes";
					}
				})
				// Retweet
				axios({
					method: "GET",
					url: "http://localhost:3002/tweets/" + response["data"]["tweet"]["id"] + "/original_retweet"
				}).then((response) => {
					setRetweetID(response["data"]["lastID"])
					let retweet_api_url = "http://localhost:3002/tweets/" + response["data"]["lastID"] + "/retweet"
					axios({
						method: "GET",
						url: retweet_api_url
					}).then((response4) => {
						let retweet_array = response4["data"]["retweets"]
						document.getElementsByClassName("retweet-length")[props.t_index].innerText = retweet_array.length + " Retweets"
						document.getElementsByClassName("no-retweet-length")[props.t_index].innerText = retweet_array.length + " Retweets"
						// いい書き方がないか ...
						if (retweet_array.length == 0) {
							document.getElementsByClassName("retweet-content")[props.t_index].classList.add("hidden-retweet")
						} else {
							document.getElementsByClassName("no-retweet-content")[props.t_index].classList.add("hidden-retweet")
						}
					})
				})
			})
			// Reply
			let reply_api_url = "http://localhost:3002/tweets/" + props.tweet_id + "/reply"
			axios({
				method: "GET",
				url: reply_api_url
			}).then((response) => {
				document.getElementsByClassName("reply-length")[props.t_index].innerText = response["data"]["replys"].length + "Replys"
				document.getElementsByClassName("no-like-reply-length")[props.t_index].innerText = response["data"]["replys"].length + "Replys"
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

	//
	const like_post = (tweet_id, index) => {
		document.getElementsByClassName("like-section")[index].classList.remove("hidden-like")
		document.getElementsByClassName("no-like-section")[index].classList.add("hidden-like")
		axios({
			method: "POST",
			url: "http://localhost:3002/tweets/" + tweet_id + "/like",
			withCredentials: true
		})
		get_current_like_status(tweet_id, index)
	}

	const cancel_like_post = (tweet_id, index) => {
		document.getElementsByClassName("like-section")[index].classList.add("hidden-like")
		document.getElementsByClassName("no-like-section")[index].classList.remove("hidden-like")
		axios({
			method: "POST",
			url: "http://localhost:3002/tweets/" + tweet_id + "/unlike",
			withCredentials: true
		})
		get_current_like_status(tweet_id, index)
	}

	const get_current_like_status = (tweet_id, index) => {
		let current_like_url = "http://localhost:3002/tweets/" + tweet_id + "/like"
		axios({
			method: "GET",
			url: current_like_url
		}).then((response) => {
			let user_count = response["data"]["users"].length
			document.getElementsByClassName("like-length")[index].innerText = user_count + "Likes";
			document.getElementsByClassName("no-like-length")[index].innerText = user_count + "Likes";
		})
	}

	const retweet_tweet = (index) => {
		let tweet_id = retweetID
		document.getElementsByClassName("retweet-content")[index].classList.remove("hidden-retweet");
		document.getElementsByClassName("no-retweet-content")[index].classList.add("hidden-retweet");
		axios({
			method: "POST",
			url: "http://localhost:3002/retweet",
			data: {tweet_id: tweet_id},
			withCredentials: true
		}).then((response) => {
			get_current_retweet_status(index)
		})
	}

	const cancel_retweet_tweet = (index) => {
		let tweet_id = retweetID
		console.log(tweet_id)
		document.getElementsByClassName("retweet-content")[index].classList.add("hidden-retweet");
		document.getElementsByClassName("no-retweet-content")[index].classList.remove("hidden-retweet");
		axios({
			method: "POST",
			url: "http://localhost:3002/tweets/" + tweet_id + "/cancel_retweet",
			withCredentials: true
		}).then((response) => {
			get_current_retweet_status(index)
		})
	}

	const get_current_retweet_status = (index) => {
		let tweet_id = retweetID
		let current_retweet_api_url = "http://localhost:3002/tweets/" + tweet_id + "/retweet"
		axios({
			method: "GET",
			url: current_retweet_api_url
		}).then((response) => {
			let user_count = response["data"]["retweets"].length
			document.getElementsByClassName("retweet-length")[index].innerText = user_count + " Retweets"
			document.getElementsByClassName("no-retweet-length")[index].innerText = user_count + " Retweets"
		})
	}

	return(
		<>
			<div className="tweetcard">
				{ tweet["is_retweet"] != 0 &&
					<p>
						{retweetUser.lastname} {retweetUser.firstname} さんが、リツイートしました。
					</p>
				}
				<div className="tweetcard-title row">
					<div className="col-2">
						{ user["avatar_image_url"] == "" &&
							<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img-big" />
						}
						{ user["avatar_image_url"] != "" &&
							<img src={user["avatar_image_url"]} className="user-avatar-img-big" />
						}
					</div>
					<div className="col-10">
						<Link to={'/users/'+user.id} className="tweet-user-name">
							<strong>{user.lastname} {user.firstname}</strong>
						</Link>
						<div className="tweetcard-content">
							{ props.is_timeline == 0 &&
								<>
									<h6>
										{tweet.content}
									</h6>
									{tweet.created_at}
								</>
							}
							{ props.is_timeline == 1 &&
								<>
									{tweet.created_at}
									<Link to={"/tweets/"+tweet.id} className="tweetcard-content-a">
										<p>
											{tweet.content}
										</p>
									</Link>
								</>
							}
							<div className="tweetcard-like-content">
								<div className="like-section">
									<div className="like-row">
										<img src={heart_normal} className="like-img" onClick={()=>cancel_like_post(tweet.id, props.t_index)} />
										<span className="like-length">0Likes</span>
										<img src={reply_normal} className="reply-img" />
										<span className="reply-length">0Replys</span>
									</div>
								</div>
								<div className="no-like-section">
									<div className="like-row">
										<img src={heart_dark} className="no-like-img" onClick={()=>like_post(tweet.id, props.t_index)} />
										<span className="no-like-length">0Likes</span>
										<img src={reply_normal} className="no-like-reply-img" />
										<span className="no-like-reply-length">0Replys</span>
									</div>
								</div>
								<div className="retweet-section">
									<div className="retweet-row">
										<div className="retweet-content">
											<img src={retweet_normal} className="retweet-img" onClick={() => cancel_retweet_tweet(props.t_index)} />
											<span className="retweet-length">0</span>
										</div>
										<div className="no-retweet-content">
											<img src={retweet_dark} className="no-retweet-img" onClick={() => retweet_tweet(props.t_index)} />
											<span className="no-retweet-length">0</span>
										</div>
									</div>
								</div>
							</div>
							{(currentUser["id"] == tweet["user_id"] && props.is_tweet_delete == 1) &&
								<button className="btn btn-sm btn-danger" onClick={delete_tweet}>ツイートを削除する</button>
							}
						</div>
					</div>
				</div>
				<hr />
			</div>
		</>
	)
}

export default TweetComponent