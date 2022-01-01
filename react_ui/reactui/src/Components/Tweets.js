import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import {useSelector, useDispatch} from "react-redux"

import TweetComponent from "./TweetComponent"
import UserComponent from "./UserComponent"
import {getTweet, concatTweet,
		getCurrentUserData, getCurrentUser} from "../actions"
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"

const Tweets = () => {
	const [users, setUsers] = useState([]);
	const dispatch = useDispatch()
	const tweets = useSelector(state => state.tweets)
	const currentuser = useSelector(state => state.currentuser)
	const useeffect_counter = 0;
	const [offset, setOffset] = useState(1)

	useEffect(() => {
		dispatch(getTweet());
		checkUserSignedIn();
	}, [useeffect_counter])

	const checkUserSignedIn = () => {
		if ( currentuser["id"] != undefined ) {
			if ( tweets.length == 0 ) {
				axios({
					method: "GET",
					url: "http://localhost:3002/users"
				}).then((response3) => {
					setUsers(response3["data"]["users"])
				})
			}
		}
	}

	const fixHeader = () => {
		dispatch(getCurrentUser())
		let avatar_image_url = currentuser["avatar_image_url"]
		let full_name = currentuser["lastname"] + " " + currentuser["firstname"] + "さん"
		let header_li = document.getElementsByClassName("tweet-nav-link-title")[0]
		let header_img = document.getElementsByClassName("tweet-nav-link-img")[0]
		header_img.setAttribute("src", avatar_image_url)
		header_li.innerText = full_name
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
				dispatch(getCurrentUser())
				dispatch(getTweet());
				fixHeader()
				window.location.assign("/")
			}
		})
	}

	const addTweet = () => {
		dispatch(concatTweet(offset))
		let next_offset = offset + 1
		setOffset(next_offset)
	}

	return (
		<div>
			{/* 酷い書き方 */}
			{ currentuser["id"] == undefined &&
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
			{/* 酷い書き方 */}
			{ currentuser["id"] != undefined &&
				<div>
					{ tweets.length != 0 &&
						<>
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
							<div style={{marginLeft:"190px"}}>
								<button
									onClick={() => addTweet()}>
									もっと見る
								</button>
							</div>
						</>
					}
					{ tweets.length == 0 &&
						<div>
							<h4 className="start-twitter-title">ユーザーをフォローして ツイッターを始めよう！</h4>
							{users.map((user) => {
								return(
									<UserComponent user_id={user.id} />
								)
							})}
						</div>
					}
				</div>
			}
		</div>
	)
}

export default Tweets;