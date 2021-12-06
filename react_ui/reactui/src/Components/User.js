import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"
import "./CSS/Users.css"
import "./CSS/Tweets.css"

const User = () => {

	const [user, setUser] = useState({});
	const [tweets, setTweets] = useState([]);
	const [currentuser, setCurrentuser] = useState({});
	const [userIDFollow, setUserIDFollow] = useState([]);
	const [userIDFollowing, setUserIDFollowing] = useState([]);
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
			// tweets
			let user_tweets_api_url = "http://localhost:3002/users/" + query.id + "/tweets"
			axios({
				method: "GET",
				url: user_tweets_api_url
			}).then((response2) => {
				console.log(response2["data"]["tweets"])
				setTweets(response2["data"]["tweets"])
			})
			// current user
			let user_signed_in_api_url = "http://localhost:3002/signed_in_user"
			axios({
				method: "GET",
				url: user_signed_in_api_url,
				withCredentials: true
			}).then((response3) => {
				if (response3["data"]["user"] != undefined){
					setCurrentuser(response3["data"]["user"]);
				} else {
					setCurrentuser({"id": 0})
				}
			})
			followStatus()
		}
	}

	const followStatus = () => {
		// follow
		let user_follow_api_url = "http://localhost:3002/users/" + query.id + "/follow"
		axios({
			method: "GET",
			url: user_follow_api_url
		}).then((response4) => {
			let follow_array = []
			response4["data"]["users"].forEach(function(user_row){
				follow_array.push(user_row["id"])
			})
			setUserIDFollow(follow_array)
		})
		// following
		let user_following_api_url = "http://localhost:3002/users/" + query.id + "/following"
		axios({
			method: "GET",
			url: user_following_api_url
		}).then((response5) => {
			let following_array = []
			response5["data"]["users"].forEach(function(user_row){
				following_array.push(user_row["id"])
			})
			setUserIDFollowing(response5["data"]["users"])
		})
	}

	const followUser = () => {
		let follow_user_api_url = "http://localhost:3002/follow/" + user.id
		axios({
			method: "POST",
			url: follow_user_api_url,
			withCredentials: true
		}).then((response) => {
			console.log(response["data"])
		})
		followStatus()
	}

	const unfollowUser = () => {
		let unfollow_user_api_url = "http://localhost:3002/unfollow/" + user.id
		axios({
			method: "POST",
			url: unfollow_user_api_url,
			withCredentials: true
		}).then((response) => {
			console.log(response["data"])
		})
		followStatus()
	}

	return(
		<div>
			<Link to="/users" className="btn">ユーザー一覧に戻る</Link>
			{ user != undefined &&
				<div>
					<div className="users-info-card">
						<div className="user-info-title row">
							<div className="col-2">
								{ user["avatar_image_url"] == "" &&
									<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img" />
								}
								{ user["avatar_image_url"] != "" &&
									<img src={user["avatar_image_url"]} className="user-avatar-img" />
								}
							</div>
							<div className="col-7">
								{user.lastname} {user.firstname}
							</div>
							<div className="col-2">
								{ (currentuser["id"] != 0 && currentuser["id"] != user["id"]) &&
									<div>
										{ userIDFollow.includes(currentuser["id"]) == false &&
											<input type="button" className="btn btn-info" value="Follow" onClick={followUser} />
										}
										{ userIDFollow.includes(currentuser["id"]) == true &&
											<input type="button" className="btn btn-danger" value="Unfollow" onClick={unfollowUser} />
										}
									</div>
								}
							</div>
						</div>
						<Link to={'/users/'+user.id+'/following'}>{userIDFollowing.length} Following</Link>  <Link to={'/users/'+user.id+'/follow'}>{userIDFollow.length} Follow</Link>
						<div className="user-info-content">
							{user.description}
							<br />
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
								<div className="tweetcard-title row">
									<div class="col-2">
										{ user["avatar_image_url"] == "" &&
											<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img" />
										}
										{ user["avatar_image_url"] != "" &&
											<img src={user["avatar_image_url"]} className="user-avatar-img" />
										}
									</div>
									<div class="col-10">
										<Link to={"/users/"+user.id} className="tweet-user-name">
											<strong>
												{user.lastname} {user.firstname}
											</strong>
										</Link>
										<br />
										{tweet.created_at}
										<div className="tweetcard-content">
											<Link to={'/tweets/'+tweet.id} className="tweetcard-content-a">
												{tweet.content}
											</Link>
										</div>
									</div>
								</div>
								<hr />
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