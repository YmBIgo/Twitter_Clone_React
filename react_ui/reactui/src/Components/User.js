import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"
import "./CSS/Users.css"

const User = () => {

	const [user, setUser] = useState({});
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
	}

	return(
		<div>
			<Link to="/users" className="btn">ユーザー一覧へ</Link>
			{ user != undefined &&
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
			}
			{ user == undefined &&
				<div> User not found </div>
			}
		</div>
	)
}

export default User;