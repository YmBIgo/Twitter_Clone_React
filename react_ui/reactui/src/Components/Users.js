import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./CSS/Users.css"

const Users = () => {

	const [users, setUsers] = useState([]);
	const [currentuser, setCurrentuser] = useState({});
	const [followID, setFollowID] = useState([]);
	let useeffect_counter = 0;

	const getUsers = () => {
		axios({
			method: "GET",
			url: "http://localhost:3002/users"
		}).then((response) => {
			setUsers(response["data"]["users"])
		})
		let signed_in_user_api_url = "http://localhost:3002/signed_in_user"
		axios({
			method: "GET",
			url: signed_in_user_api_url,
			withCredentials: true
		}).then((response) => {
			if (response["data"]["user"] != undefined){
				// followStatus に response を渡す必要 ...
				setCurrentuser(response["data"]["user"])
				followStatus(response["data"]["user"])
				console.log(followID)
			} else {
				setCurrentuser({"id": 0})
			}
		})
	}

	const followStatus = (_currentuser) => {
		let user_follow_api_url = "http://localhost:3002/users/" + _currentuser["id"] + "/following"
		let user_follow_array = []
		axios({
			method: "GET",
			url: user_follow_api_url
		}).then((response) => {
			response["data"]["users"].forEach(function(user){
				user_follow_array.push(user["id"])
			})
			setFollowID(user_follow_array)
		})
	}

	const followUser = (user) => {
		let follow_user_api_url = "http://localhost:3002/follow/" + user.id
		console.log(follow_user_api_url);
		axios({
			method: "POST",
			url: follow_user_api_url,
			withCredentials: true
		}).then((response) => {
			console.log(response["data"])
		})
		followStatus(currentuser);
	}

	const unfollowUser = (user) => {
		let unfollow_user_api_url = "http://localhost:3002/unfollow/" + user.id
		console.log(unfollow_user_api_url)
		axios({
			method: "POST",
			url: unfollow_user_api_url,
			withCredentials: true
		}).then((response) => {
			console.log(response["data"])
		})
		followStatus(currentuser);
	}

	useEffect(() => {
		getUsers()
	}, [useeffect_counter]);

	return (
		<div>
			<h4>ユーザー一覧</h4>
			{users.map((user, index) => {
				return (
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
								<Link to={'/users/'+user.id}>
									{user.lastname} {user.firstname} 
								</Link>
							</div>
							<div className="col-2">
								{ (currentuser["id"] != 0 && followID.includes(user.id) == false && currentuser["id"] != user["id"] ) &&
									<div>
										<button className="btn btn-info" userid={user.id} onClick={() => followUser(user)}>follow</button>
									</div>
								}
								{ (currentuser["id"] != 0 && followID.includes(user.id) == true) &&
									<div>
										<button className="btn btn-danger" userid={user.id} onClick={() => unfollowUser(user)}>Unfollow</button>
									</div>
								}
							</div>
						</div>
						<div className="user-info-content">
							{user.description}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default Users;