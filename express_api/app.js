const express = require("express");
const app = express();
const tweet_db = require("./lib/express_tweet_db")

const cookieParser = require("cookie-parser");
const crypto = require("crypto")

const db = tweet_db.initialize_db("./db/express_api.db");

function md5base64(str){
	const md5 = crypto.createHash('md5');
	return md5.update(str, 'binary').digest('base64')
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
	res.status(200).send("Hello World")
});


// User

app.get("/users", (req, res) => {
	tweet_db.select_all_user(db, res);
})
app.get("/users/:id", (req, res) => {
	let user_id = req.params.id;
	tweet_db.select_id_user(db, user_id, res)
})
app.get("/signed_in_user", (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	tweet_db.select_cookie_user(db, user_data, res);
})
app.post("/users", (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let email = req.body.email;
	let password_original = req.body.password;
	// Email や Password の 正規表現 ...
	if ( firstname != undefined && lastname != undefined && email != undefined && password_original != undefined ){
		let password = md5base64(password_original);
		let cookie_original = crypto.randomBytes(8).toString("base64");
		let cookietext = md5base64(cookie_original);
		let user_data = {
			"firstname": firstname,
			"lastname": lastname,
			"email": email,
			"password": password,
			"cookietext": cookietext
		}
		// cookie を ブラウザで確認
		res.cookie("email", email)
		res.cookie("cookietext", cookietext)
		tweet_db.create_user(db, user_data, res)
	} else {
		res.status(200).json({
			"status": "error",
			"message": "data is not correct"
		})
	}
});
app.post("/users/update/:id", (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let description = req.body.description;
	let id = req.params.id
	if ( firstname != undefined && lastname != undefined && description != undefined && id != undefined) {
		let user_data = {
			"firstname": firstname,
			"lastname": lastname,
			"description": description,
			"email": req.cookies["email"],
			"cookietext": req.cookies["cookietext"]
		}
		tweet_db.update_user_normal_data(db, user_data, id, res)
	} else {
		res.status(200).json({
			"status": "error",
			"message": "data is not correct"
		})
	}
});
app.post("/users/password_update/:id", (req, res) => {
	//
	let password = req.body.password;
	let new_password = req.body.newpassword;
	let user_id = req.params.id;
	if ( password != undefined && new_password != undefined && user_id != undefined ) {
		let user_data = {
			"password": md5base64(password),
			"email": req.cookies["email"]
		}
		let new_user_data = {
			"password" : md5base64(new_password)
		}
		tweet_db.update_user_password_data(db, user_data, new_user_data, user_id, res)
	} else {
		res.status(200).json({
			"status": "error",
			"message": "data is not correct"
		})
	}
})
app.post("/users/sign_in", (req, res) => {
	//
	let password = req.body.password;
	let email = req.body.email;
	if ( password != undefined && email != undefined ) {
		let user_data = {
			"password": md5base64(password),
			"email": email
		}
		tweet_db.update_user_cookie_data(db, user_data, res)
	}
})
// delete を post にしている。
app.post("/users/delete/:id", (req, res) => {
	//
	let password = req.body.password;
	let user_id = req.params.id;
	if ( password != undefined ) {
		let user_data = {
			"password" : md5base64(password),
			"email": req.cookies["email"]
		}
		tweet_db.delete_user(db, user_data, user_id, res)
	}
})

// Tweet
app.get("/tweets", (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	tweet_db.select_all_tweet(db, user_data, res)
})
app.get("/tweets/:id", (req, res) => {
	let tweet_id = req.params.id
	tweet_db.select_id_tweet(db, tweet_id, res)
})
app.post("/tweets", (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_data = {
		"content": req.body.content
	}
	tweet_db.create_tweet(db, tweet_data, user_data, res)
})
app.post("/tweets/delete/:id", (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.params.id
	let tweet_data = {"id": tweet_id}
	tweet_db.delete_tweet(db, tweet_data, user_data, res)
})

var server = app.listen(3002, () => {
	console.log("App Listening on port " + server.address().port)
});

