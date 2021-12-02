import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"
import "./CSS/Users.css"
import "./CSS/Tweets.css"

const User = () => {

	const [user, setUser] = useState({});
	const [tweets, setTweets] = useState([]);
	const query = useParams();
	const useeffect_counter = 0;

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
			let user_tweets_api_url = "http://localhost:3002/users/" + query.id + "/tweets"
			axios({
				method: "GET",
				url: user_tweets_api_url
			}).then((response) => {
				console.log(response["data"]["tweets"])
				setTweets(response["data"]["tweets"])
			})
		}
	}

	return(
		<div>
			<Link to="/users" className="btn">ユーザー一覧に戻る</Link>
			{ user != undefined &&
				<div>
					<div className="users-info-card">
						<div className="user-info-title">
							{user.lastname} {user.firstname}
							<span className="user-info-title-email">
								{user.email}
							</span>
						</div>
						<hr />
						<div className="user-info-content">
							{user.description}
						</div>
					</div>
					<br/>
					<h4>ツイート一覧</h4>
					{tweets.map((tweet) => {
						return(
							<div className="tweetcard">
								<Link to={'/tweets/'+tweet.id}>
									<div className="tweetcard-title">
										{tweet.id} : {user.lastname} {user.firstname}
									</div>
									<div className="tweetcard-content">
										{tweet.content}
									</div>
								</Link>
							</div>
						)
					})}
				</div>
			}
			{ user == undefined &&
				<div> User not found </div>
			}
		</div>
	)
}

export default User;