import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./CSS/Users.css"

const Users = () => {

	const [users, setUsers] = useState([]);
	let useeffect_counter = 0;

	const getUsers = () => {
		axios({
			method: "GET",
			url: "http://localhost:3002/users"
		}).then((response) => {
			setUsers(response["data"]["users"])
		})
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
						<div className="user-info-title">
							<Link to={'/users/'+user.id}>
								{user.lastname} {user.firstname} 
							</Link>
							<span className="user-info-title-email">
								{user.email}
							</span>
						</div>
						<hr />
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