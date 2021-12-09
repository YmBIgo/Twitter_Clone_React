import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./CSS/Tweets.css"

const TweetNew = () => {

	const [userSignedIn, setUserSignedIn] = useState(0);
	const [currentuser, setCurrentuser] = useState({}); 
	const useeffect_counter = 0

	useEffect(() => {
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
				setCurrentuser(response["data"]["user"]);
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
				fixHeader()
				setUserSignedIn(1)
			}
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
					<br />
					<div>
						<Link to="/users/new">サインアップする</Link>
					</div>
				</div>
			}
			{ userSignedIn == 1 &&
				<div>
					<Link to="/tweets" className="btn">
						ツイートタイムラインに戻る
					</Link>
					<div className="tweetcard">
						<h4>
							<Link to={"/users/"+currentuser["id"]}>
								<img src={currentuser["avatar_image_url"]} className="user-avatar-img" />
							</Link>
							ツイート作成
						</h4>
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