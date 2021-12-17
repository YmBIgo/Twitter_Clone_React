import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"
import {useSelector} from "react-redux"

import TweetComponent from "./TweetComponent"
import UserComponent from "./UserComponent"
import "./CSS/Users.css"
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"

const User = () => {

	const [user, setUser] = useState({});
	const [tweets, setTweets] = useState([]);
	const [userIDFollow, setUserIDFollow] = useState([]);
	const [userIDFollowing, setUserIDFollowing] = useState([]);
	const query = useParams();
	const useeffect_counter = 0;

	const currentuser = useSelector(state => state.currentuser)

	useEffect(() => {
		getUser();
	}, [useeffect_counter])

	const getUser = () => {
		let user_api_url = "http://localhost:3002/users/" + query.id
		axios({
			method: "GET",
			url: user_api_url
		}).then((response) => {
			setUser(response["data"]["user"])
		})
		if ( user != undefined ){
			// tweets
			let user_tweets_api_url = "http://localhost:3002/users/" + query.id + "/tweets"
			axios({
				method: "GET",
				url: user_tweets_api_url
			}).then((response2) => {
				console.log(response2["data"]["tweets"])
				setTweets(response2["data"]["tweets"])
			})
		}
	}

	return(
		<div>
			<Link to="/users" className="btn">ユーザー一覧に戻る</Link>
			{ user != undefined &&
				<div>
					<UserComponent user_id={query.id} />
					<br/>
					<h4>ツイート一覧</h4>
					{tweets.map((tweet, index) => {
						return(
							<TweetComponent tweet_id={tweet.id} t_index={index} is_tweet_delete="0" is_timeline="1" />
						)
					})}
				</div>
			}
			{ user == undefined &&
				<div>
					<h4>User not found</h4>
					<br/>
					<Link to="/users/">ユーザー一覧に戻る</Link>
				</div>
			}
		</div>
	)
}

export default User;