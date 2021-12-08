import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import TweetComponent from "./TweetComponent"
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
							return(
								<TweetComponent tweet_id={tweet.id} t_index={index} is_timeline="1" />
							)
						})}
					</div>
				</div>
			}
		</div>
	)
}

export default Tweets;