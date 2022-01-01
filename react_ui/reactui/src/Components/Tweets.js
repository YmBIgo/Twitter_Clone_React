import React, { useState, useEffect, useRef } from "react";
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
	// 
	const useeffect_counter = 0;
	// 
	const [offset, setOffset] = useState(1)
	const offsetRef = useRef(offset)
	offsetRef.current = offset
	// 
	const [paginationPos, setPaginationPos] = useState(0)
	const paginationPosRef = useRef(paginationPos)
	paginationPosRef.current = paginationPos
	// 
	const [isScroll, setIsScroll] = useState(true)

	useEffect(() => {
		dispatch(getTweet());
		checkUserSignedIn();
		window.setTimeout(initializePagination, 1000); /* 書き方... */
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
		dispatch(concatTweet(offsetRef.current))
		let next_offset = offsetRef.current + 1
		setOffset(next_offset)
	}

	const initializePagination = () => {
		getAndSetPaginationPos()
		var tweets_timeline_area = document.getElementsByClassName("tweet-timeline")[0]
		window.addEventListener('scroll', onScrollPagination)
	}

	const onScrollPagination = (e) => {
		// console.log(window.scrollY + window.innerHeight, paginationPosRef.current)
		if (window.scrollY + window.innerHeight > paginationPosRef.current ) {
			// setIsScroll(false)
			addTweet()
			var tweets_timeline_area = document.getElementsByClassName("tweet-timeline")[0]
			window.removeEventListener('scroll', onScrollPagination)
			// 300 って何？
			// setPaginationPos(paginationPosRef.current + firstPaginationPosRef.current - 300)
			getAndSetPaginationPos()
			console.log(paginationPosRef.current, offsetRef.current)
			window.addEventListener('scroll', onScrollPagination)
		}
	}

	const getAndSetPaginationPos = () => {
		var pagination_area = document.getElementsByClassName("tweet_pagination_area")[0]
		setPaginationPos(pagination_area.offsetTop)
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
							<div className="tweet-timeline">
								{tweets.map((tweet, index) => {
									return(
										<TweetComponent tweet_id={tweet.id} t_index={index} is_timeline="1" />
									)
								})}
							</div>
							<div className="tweet_pagination_area"
								 style={{marginLeft:"190px"}}>
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