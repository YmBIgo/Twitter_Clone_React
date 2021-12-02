import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./CSS/Tweets.css"

const TweetNew = () => {

	const [userSignedIn, setUserSignedIn] = useState(0);
	const useeffect_counter = 0

	useEffect(() => {
		//
		checkUserSignedIn()
	}, [useeffect_counter]);

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

	const createTweet = (event) => {
		let tweet_content = document.getElementsByClassName("tweet-textarea")[0].value
		if ( tweet_content != undefined ) {
			axios({
				method: "POST",
				url: "http://localhost:3002/tweets",
				data: {content: tweet_content},
				withCredentials: true
			}).then((response) => {
				window.location.assign("/tweets")
			})
		}
	}

	return(
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
					<Link to="/tweets">ツイート一覧</Link>
					<div className="tweetcard">
						<h4>ツイート作成</h4>
						<div>
							<textarea className="tweet-textarea form-control" name="tweet"></textarea>
							<button className="btn btn-info" onClick={createTweet}>Send</button>
						</div>
					</div>
				</div>
			}
		</div>
	)
}

export default TweetNew;