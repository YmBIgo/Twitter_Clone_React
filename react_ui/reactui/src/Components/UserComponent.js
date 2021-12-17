import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom"

const UserComponent = (props) => {

	const [user, setUser] = useState({})
	const [currentuser, setCurrentuser] = useState({});
	const [userIDFollow, setUserIDFollow] = useState([]);
	const [userIDFollowing, setUserIDFollowing] = useState([]);
	const useeffect_counter = 0;

	useEffect(() => {
		get_user_data()
	}, [useeffect_counter])

	const get_user_data = () => {
		let user_api_url = "http://localhost:3002/users/" + props.user_id
		axios({
			method: "GET",
			url: user_api_url
		}).then((response) => {
			// console.log(response["data"]["user"])
			setUser(response["data"]["user"])
			if ( user != undefined ){
			// current user
			let user_signed_in_api_url = "http://localhost:3002/signed_in_user"
			axios({
				method: "GET",
				url: user_signed_in_api_url,
				withCredentials: true
			}).then((response2) => {
				if (response2["data"]["user"] != undefined){
					setCurrentuser(response2["data"]["user"]);
				} else {
					setCurrentuser({"id": 0})
				}
			})
			followStatus()
		}
		})
	}

	const followStatus = () => {
		// follow
		let user_follow_api_url = "http://localhost:3002/users/" + props.user_id + "/follow"
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
		let user_following_api_url = "http://localhost:3002/users/" + props.user_id + "/following"
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
				<div className="col-6">
					<Link to={"/users/"+user.id} className="tweet-user-name">
						<strong>
							{user.lastname} {user.firstname}
						</strong>
					</Link>
				</div>
				<div className="col-4">
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
					{ currentuser["id"] == user["id"] &&
						<div>
							<Link className="btn btn-success" to="/users/edit">ユーザーを編集</Link>
						</div>
					}
				</div>
			</div>
			<Link to={'/users/'+user.id+'/following'}>{userIDFollowing.length} Following</Link>  <Link to={'/users/'+user.id+'/follow'}>{userIDFollow.length} Follow</Link>
			<div className="user-info-content">
				{user.description}
				<br />
			</div>
		</div>
	)
}

export default UserComponent;