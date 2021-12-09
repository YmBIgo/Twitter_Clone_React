import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import UserComponent from "./UserComponent"
import "./CSS/Users.css"

const Following = () => {

	const [followings, setFollowings] = useState([]);
	const [user, setUser] = useState({});
	const useeffect_counter = 0;
	let query = useParams();

	useEffect(() => {
		get_followings()
	}, [useeffect_counter])

	const get_followings = () => {
		let user_api_url = "http://localhost:3002/users/" + query.id
		axios({
			method: "GET",
			url: user_api_url
		}).then((response1) => {
			setUser(response1["data"]["user"])
		})
		let user_follow_api_url = "http://localhost:3002/users/" + query.id + "/following"
		axios({
			method: "GET",
			url: user_follow_api_url
		}).then((response2) => {
			setFollowings(response2["data"]["users"])
			console.log(followings)
		})
	}

	return(
		<div>
			<Link to={"/users/"+user.id} className="btn">{user.lastname} {user.firstname}の情報に戻る</Link>
			<h4>{user.lastname} {user.firstname} のFollowing一覧</h4>
			<br />
			{followings.length == 0 &&
				<div>
					<p>フォローしていません。</p>
				</div>
			}
			{followings.map((following) => {
				return(
					<UserComponent user_id={following.id} />
				)
			})}
		</div>
	)
}

export default Following;