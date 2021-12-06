import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./CSS/Tweets.css"

const Tweets = () => {
	const [userSignedIn, setUserSignedIn] = useState(0);
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
			}
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
				</div>
			}
			{ userSignedIn == 1 &&
				<div>
					<h4>ツイートタイムライン</h4>
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
							let tweet_show_url = "/tweets/" + tweet.id
							return(
								<div className="tweetcard">
									<div className="tweetcard-title">
										<img className="user-avatar-img" />
										<Link to={"/users/"+tweet.user_id} className="tweet-user-name">
											<span className="tweets-username">{user_name}</span>
										</Link>
									</div>
									<div className="tweetcard-content">
										<Link to={tweet_show_url}>
											{tweet.content}
										</Link>
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