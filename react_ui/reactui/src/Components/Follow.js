import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import UserComponent from "./UserComponent"
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
			{follows.length == 0 &&
				<div>
					<p>フォローされていません。</p>
				</div>
			}
			{follows.map((follow) => {
				return(
					<UserComponent user_id={follow.id} />
				)
			})}
		</div>
	)
}

export default Follow