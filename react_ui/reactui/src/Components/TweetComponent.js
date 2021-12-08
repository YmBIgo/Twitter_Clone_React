import React, { useState, useEffect } from "react"
import axios from "axios";
import { Link } from "react-router-dom"
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"

const TweetComponent = (props) => {

	const [tweet, setTweet] = useState({});
	const [user, setUser] = useState({});
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
						document.getElementsByClassName("like-section")[props.t_index].classList.add("hidden-like");
						// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
						document.getElementsByClassName("like-length")[props.t_index].innerText = user_like.length
						document.getElementsByClassName("no-like-length")[props.t_index].innerText = user_like.length
					} else if ( user_like.includes(response2["data"]["user"]["id"]) == true ) {
						console.log("hide no like", user_like, currentUser["id"])
						document.getElementsByClassName("no-like-section")[props.t_index].classList.add("hidden-like");
						// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
						document.getElementsByClassName("like-length")[props.t_index].innerText = user_like.length
						document.getElementsByClassName("no-like-length")[props.t_index].innerText = user_like.length
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
			document.getElementsByClassName("like-length")[index].innerText = user_count;
			document.getElementsByClassName("no-like-length")[index].innerText = user_count;
		})
	}

	return(
		<>
			<div className="tweetcard">
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
										<span className="like-length">0</span>
									</div>
								</div>
								<div className="no-like-section">
									<div className="like-row">
										<img src={heart_dark} className="no-like-img" onClick={()=>like_post(tweet.id, props.t_index)} />
										<span className="no-like-length">0</span>
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