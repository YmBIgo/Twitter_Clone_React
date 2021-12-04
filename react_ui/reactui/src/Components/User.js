import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"
import "./CSS/Users.css"
import "./CSS/Tweets.css"

const User = () => {

	const [user, setUser] = useState({});
	const [tweets, setTweets] = useState([]);
	const [currentuser, setCurrentuser] = useState({});
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
			}).then((response2) => {
				console.log(response2["data"]["tweets"])
				setTweets(response2["data"]["tweets"])
			})
			let user_signed_in_api_url = "http://localhost:3002/signed_in_user"
			axios({
				method: "GET",
				url: user_signed_in_api_url,
				withCredentials: true
			}).then((response3) => {
				setCurrentuser(response3["data"]["user"]);
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
							{ user["avatar_image_url"] == "" &&
								<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img" />
							}
							{ user["avatar_image_url"] != "" &&
								<img src={user["avatar_image_url"]} className="user-avatar-img" />
							}
							{user.lastname} {user.firstname}
							<span className="user-info-title-email">
								{user.email}
							</span>
						</div>
						<hr />
						<div className="user-info-content">
							{user.description}
						</div>
						{ currentuser["id"] == user["id"] &&
							<div>
								<Link className="btn btn-success" to="/users/edit">ユーザー情報を編集</Link>
							</div>
						}
					</div>
					<br/>
					<h4>ツイート一覧</h4>
					{tweets.map((tweet) => {
						return(
							<div className="tweetcard">
								<div className="tweetcard-title">
									{ user["avatar_image_url"] == "" &&
										<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img" />
									}
									{ user["avatar_image_url"] != "" &&
										<img src={user["avatar_image_url"]} className="user-avatar-img" />
									}
									<Link to={"/users/"+user.id}>
									{user.lastname} {user.firstname}
									</Link>
								</div>
								<div className="tweetcard-content">
									<Link to={'/tweets/'+tweet.id}>
										{tweet.content}
									</Link>
								</div>
							</div>
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