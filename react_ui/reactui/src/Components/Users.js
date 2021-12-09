import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import UserComponent from "./UserComponent"
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
	}

	useEffect(() => {
		getUsers()
	}, [useeffect_counter]);

	return (
		<div>
			<h4>ユーザー一覧</h4>
			{users.map((user, index) => {
				return (
					<UserComponent user_id={user.id} />
				)
			})}
		</div>
	)
}

export default Users;