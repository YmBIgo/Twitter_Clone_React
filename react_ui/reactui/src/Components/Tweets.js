import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"

const Tweets = () => {
	const [userSignedIn, setUserSignedIn] = useState(0);
	const [currentuser, setCurrentuser] = useState({});
	const [tweets, setTweets] = useState([]);
	const useeffect_counter = 0;

	useEffect(() => {
		checkUserSignedIn();
	}, [useeffect_counter])

	const checkUserSignedIn = () => {
		axios({
			method:"GET",
			url: "http://localhost:3002/signed_in_user",
			withCredentials: true
		}).then((response) => {
			if ( response["data"]["user"] == undefined ) {
				setUserSignedIn(0)
			} else {
				setUserSignedIn(1)
				setCurrentuser(response["data"]["user"])
				axios({
					method:"GET",
					url: "http://localhost:3002/tweets",
					withCredentials: true
				}).then((response2) => {
					console.log(response2)
					setTweets(response2["data"]["tweets"])
				})
			}
			console.log(response)
		})
	}

	const fixHeader = () => {
		axios({
			method: "GET",
			url: "http://localhost:3002/signed_in_user",
			withCredentials: true
		}).then((response) => {
			let avatar_image_url = response["data"]["user"]["avatar_image_url"]
			let full_name = response["data"]["user"]["lastname"] + " " + response["data"]["user"]["firstname"] + "さん"
			let header_li = document.getElementsByClassName("tweet-nav-link-title")[0]
			let header_img = document.getElementsByClassName("tweet-nav-link-img")[0]
			header_img.setAttribute("src", avatar_image_url)
			header_li.innerText = full_name
		})
	}

	const userLogin = (event) => {
		let email = document.getElementsByClassName("email-input")[0].value
		let password = document.getElementsByClassName("password-input")[0].value
		axios({
			method: "POST",
			url: "http://localhost:3002/users/sign_in",
			data: {email: email, password: password},
			withCredentials: true
		}).then((response) => {
			if ( response["data"]["changes"] == 1 ) {
				setUserSignedIn(1)
				axios({
					method:"GET",
					url: "http://localhost:3002/tweets",
					withCredentials: true
				}).then((response2) => {
					console.log(response2)
					setTweets(response2["data"]["tweets"])
					fixHeader()
					window.location.assign("/")
				})
			}
		})
	}

	const like_post = (tweet_id, index) => {
		console.log(tweet_id, index, currentuser["id"])
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
		console.log(tweet_id, index, currentuser["id"])
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

	return (
		<div>
			{ userSignedIn == 0 &&
				<div>
					<h4>ログインしてください</h4>
					<div>
						<label>Email</label>
						<input className="email-input" type="text" name="email" />
					</div>
					<br />
					<div>
						<label>Password</label>
						<input className="password-input" type="password" name="password" />
					</div>
					<div>
						<button onClick={userLogin}>Send</button>
					</div>
					<br />
					<div>
						<Link to="/users/new">サインアップする</Link>
					</div>
				</div>
			}
			{ userSignedIn == 1 &&
				<div>
					<h4 className="tweet-page-title">
						ツイートタイムライン
					</h4>
					<div>
						{tweets.map((tweet, index) => {
							let user_name = "";
							let user_avatar_img = "";
							let user_show_url = "http://localhost:3002/users/" + tweet.user_id
							axios({
								method: "GET",
								url: user_show_url,
								withCredentials: true
							}).then((response) => {
								user_name = response["data"]["user"]["lastname"] + " " + response["data"]["user"]["firstname"];
								user_avatar_img = response["data"]["user"]["avatar_image_url"];
								// console.log(user_name, index);
								if (user_avatar_img == "") {
									user_avatar_img = "https://storage.googleapis.com/tweet_storage_0218/default/twitter.png";
								}
								document.getElementsByClassName("user-avatar-img")[index].setAttribute("src", user_avatar_img);
								document.getElementsByClassName("tweets-username")[index].innerText = user_name;
							})
							// いいね
							let like_api_url = "http://localhost:3002/tweets/" + tweet.id + "/like"
							let tweet_like = [];
							axios({
								method: "GET",
								url: like_api_url
							}).then((response3) => {
								tweet_like = response3["data"]["users"];
								let user_tweet_like = []
								tweet_like.forEach(function(item){
									user_tweet_like.push(item["id"])
								})
								if (user_tweet_like.includes(currentuser["id"]) == false){
									document.getElementsByClassName("like-section")[index].classList.add("hidden-like");
									// document.getElementsByClassName("no-like-section")[0].classList.add("show-like");
									document.getElementsByClassName("like-length")[index].innerText = tweet_like.length
									document.getElementsByClassName("no-like-length")[index].innerText = tweet_like.length
								} else {
									document.getElementsByClassName("no-like-section")[index].classList.add("hidden-like");
									// document.getElementsByClassName("like-section")[0].classList.add("show-like");
									document.getElementsByClassName("like-length")[index].innerText = tweet_like.length
									document.getElementsByClassName("no-like-length")[index].innerText = tweet_like.length
								}
							})
							let tweet_show_url = "/tweets/" + tweet.id
							return(
								<div className="tweetcard">
									<div className="tweetcard-title row">
										<div className="col-2">
											<img className="user-avatar-img" />
										</div>
										<div className="col-10 tweetcard-content">
											<Link to={"/users/"+tweet.user_id} className="tweet-user-name">
												<strong>
													<span className="tweets-username">{user_name}</span>
												</strong>
											</Link>
											<br />
											{tweet.created_at}
											<Link to={tweet_show_url} className="tweetcard-content-a">
												<div>
													{tweet.content}
												</div>
											</Link>
											<div className="like-section">
												<div className="like-row">
													<a onClick={() => cancel_like_post(tweet.id, index)}>
														<img src={heart_normal} className="like-img" />
													</a>
													<span className="like-length">0</span>
												</div>
											</div>
											<div className="no-like-section">
												<div className="like-row">
													<a onClick={() => like_post(tweet.id, index)}>
														<img src={heart_dark} className="no-like-img" />
													</a>
													<span className="no-like-length">0</span>
												</div>
											</div>
										</div>
										<hr />
									</div>
					
								</div>
							)
						})}
					</div>
				</div>
			}
		</div>
	)
}

export default Tweets;