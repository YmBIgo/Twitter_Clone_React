import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/UserEdit.css";
import "./CSS/Users.css"

const UserEdit = () => {

	const [userSignedIn, setUserSignedIn] = useState(0);
	const [user, setUser] = useState({lastname: "", firstname: "", description: ""});
	const [lastname, setLastname] = useState("");
	const [firstname, setFirstname] = useState("");
	const [description, setDescription] = useState("");

	const useeffect_counter = 0

	useEffect(() => {
		checkUserSignedIn()
	}, [useeffect_counter]);

	const checkUserSignedIn = () => {
		axios({
			method:"GET",
			url: "http://localhost:3002/signed_in_user",
			withCredentials: true
		}).then((response) => {
			if ( response["data"]["user"] == undefined ) {
				setUserSignedIn(0)
			} else {
				setUserSignedIn(1)
				setUser(response["data"]["user"]);
				// 書き方がビミョウ
				setLastname(response["data"]["user"]["lastname"])
				setFirstname(response["data"]["user"]["firstname"])
				setDescription(response["data"]["user"]["description"])
			}
			console.log(response)
		})
	}

	const userLogin = (event) => {
		let email = document.getElementsByClassName("email-input")[0].value
		let password = document.getElementsByClassName("password-input")[0].value
		axios({
			method: "POST",
			url: "http://localhost:3002/users/sign_in",
			data: {email: email, password: password},
			withCredentials: true
		}).then((response) => {
			if ( response["data"]["changes"] == 1 ) {
				setUserSignedIn(1)
			}
		})
	}

	const changedInput = (event) => {
		let inputted_lastname = document.getElementsByClassName("lastname-input").value;
		let inputted_firstname = document.getElementsByClassName("firstname-input").value;
		let inputted_description = document.getElementsByClassName("description-input").value;
		setLastname(inputted_lastname)
		setFirstname(inputted_firstname)
		setDescription(inputted_description);

	}

	const updateUserData = (event) => {
		event.preventDefault();
		let fixed_lastname = document.getElementsByClassName("lastname-input")[0].value;
		let fixed_firstname = document.getElementsByClassName("firstname-input")[0].value;
		let fixed_description = document.getElementsByClassName("description-input")[0].value;
		let user_update_url = "http://localhost:3002/users/update/" + user["id"]
		axios({
			method: "POST",
			url: user_update_url,
			data: { lastname:fixed_lastname, firstname:fixed_firstname, description: fixed_description },
			withCredentials: true
		}).then((response) => {
			console.log(response)
			window.location.assign("http://localhost:3000/users/" + user["id"])
		})
	}

	return (
		<div>
			{ userSignedIn == 0 &&
				<div>
					<h4>ログインしてください</h4>
					<div>
						<label>Email</label>
						<input className="email-input" type="text" name="email" />
					</div>
					<br />
					<div>
						<label>Password</label>
						<input className="password-input" type="password" name="password" />
					</div>
					<div>
						<button onClick={userLogin}>Send</button>
					</div>
				</div>
			}
			{ userSignedIn == 1 &&
				<div>
					<div className="users-info-card">
						<h4>ユーザー画像を編集する</h4>
						{// なんかビミョウ
						}
						<form action={'http://localhost:3002/users/upload_image/'+user.id} method="POST" enctype="multipart/form-data">
							<input className="avatar-input" type="file" name="avatar" accept="image/*" />
							<br />
							<button className="btn btn-success" >Send</button>
						</form>
					</div>
					<br />
					<div className="users-info-card">
						<h4>ユーザーを編集する</h4>
						<label>Last Name</label>
						<input className="lastname-input form-control" type="text" name="lastname" onChange={changedInput} value={lastname} />
						<br />
						<label>First Name</label>
						<input className="firstname-input form-control" type="text" name="firstname" onChange={changedInput} value={firstname} />
						<br />
						<label>Description</label>
						<textarea className="description-input form-control" name="description" onChange={changedInput} value={description}></textarea>
						<button className="btn btn-primary" onClick={updateUserData}>Send</button>
					</div>
				</div>
			}
		</div>
	)
}

export default UserEdit;