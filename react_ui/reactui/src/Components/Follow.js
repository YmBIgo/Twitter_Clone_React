import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./CSS/Users.css"

const Follow = () => {

	const [follows, setFollows] = useState([]);
	const [user, setUser] = useState({});
	const useeffect_counter = 0;
	let query = useParams();

	useEffect(() => {
		get_follows()
	}, [useeffect_counter])

	const get_follows = () => {
		let user_api_url = "http://localhost:3002/users/" + query.id
		axios({
			method: "GET",
			url: user_api_url
		}).then((response1) => {
			setUser(response1["data"]["user"])
		})
		let user_follow_api_url = "http://localhost:3002/users/" + query.id + "/follow"
		axios({
			method: "GET",
			url: user_follow_api_url
		}).then((response2) => {
			setFollows(response2["data"]["users"])
			console.log(follows)
		})
	}

	return(
		<div>
			<Link to={"/users/"+user.id} className="btn">{user.lastname} {user.firstname}の情報に戻る</Link>
			<h4>{user.lastname} {user.firstname} のFollow一覧</h4>
			<br />
			{follows.map((follow) => {
				return(
					<div className="users-info-card">
						<div className="user-info-title">
							{ follow["avatar_image_url"] == "" &&
								<img src="https://storage.googleapis.com/tweet_storage_0218/default/twitter.png" className="user-avatar-img" />
							}
							{ follow["avatar_image_url"] != "" &&
								<img src={follow["avatar_image_url"]} className="user-avatar-img" />
							}
							<Link to={'/users/'+follow.id}>
								{follow.lastname} {follow.firstname} 
							</Link>
							<span className="user-info-title-email">
								{follow.email}
							</span>
						</div>
						<hr />
						<div className="user-info-content">
							{follow.description}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default Follow