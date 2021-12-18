import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom"
import {useSelector, useDispatch} from "react-redux"

import {getCurrentUser} from "../actions"
import "./CSS/Users.css"

const UserCreate = () => {

	const useeffect_counter = 0
	const [userSignedIn, setUserSignedIn] = useState(0)

	const dispatch = useDispatch()
	const currentuser = useSelector(state => state.currentuser)

	useEffect(() => {
		checkUserSignIn()
	}, [useeffect_counter])

	const checkUserSignIn = () => {
		if ( currentuser["id"] != undefined ) {
			window.location.assign("http://localhost:3000")
		}
	}

	const createUser = () => {
		let lastname = document.getElementsByClassName("lastname-input")[0].value
		let firstname = document.getElementsByClassName("firstname-input")[0].value
		let email = document.getElementsByClassName("email-input")[0].value
		let password = document.getElementsByClassName("password-input")[0].value
		let user_data = {
			lastname: lastname,
			firstname: firstname,
			email: email,
			password: password
		}
		axios({
			method: "POST",
			url: "http://localhost:3002/users",
			data: user_data
		}).then((response) => {
			console.log(response["data"])
			if ( response["data"]["lastID"] != undefined ){
				dispatch(getCurrentUser())
				window.location.assign("/")
			}
		})
	}

	return(
		<div>
			<Link to="/" className="btn">ログインに戻る</Link>
			<div className="users-info-card">
				<h4>ユーザー登録する</h4>
				<label>Last name</label>
				<input type="text" name="lastname" className="form-control lastname-input" />
				<label>First name</label>
				<input type="text" name="firstname" className="form-control firstname-input" />
				<label>Email</label>
				<input type="text" name="email" className="form-control email-input" />
				<label>Password</label>
				<input type="password" name="password" className="form-control password-input" />
				<br />
				<button className="btn btn-primary" onClick={createUser}>Send</button>
			</div>
		</div>
	)
}

export default UserCreate;