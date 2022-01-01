const express = require("express");
const app = express();
const cors = require("cors")
const tweet_db = require("./lib/express_tweet_db");
const fs = require("fs");
const multer = require("multer");
const google_cs = require("./lib/gcp_cloud_storage")
const got = require("got")

const cookieParser = require("cookie-parser");
const crypto = require("crypto")

const db = tweet_db.initialize_db("./db/express_api.db");

function md5base64(str){
	const md5 = crypto.createHash('md5');
	return md5.update(str, 'binary').digest('base64')
}

const corsOptions = {
	credentials: true,
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200,
}

const uploader = multer({ dest: './temp_file/' })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions))

var server = app.listen(3002, () => {
	console.log("App Listening on PORT : " + server.address().port)
});

// 

app.get("/", (req, res) => {
	res.status(200).send("Hello World")
});

// User

app.get("/users", cors(corsOptions), (req, res) => {
	tweet_db.select_all_user(db, res);
})
app.get("/users/:id", cors(corsOptions), (req, res) => {
	let user_id = req.params.id;
	tweet_db.select_id_user(db, user_id, res)
})
app.get("/signed_in_user", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	tweet_db.select_cookie_user(db, user_data, res);
})
app.post("/users", cors(corsOptions), (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let email = req.body.email;
	let password_original = req.body.password;
	// Email や Password の 正規表現 ...
	if ( firstname != "" && lastname != "" && email != "" && password_original != "" ){
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
app.post("/users/update/:id", uploader.single('avatar'), (req, res) => {
	// , uploader.single('avatar')
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let description = req.body.description;
	let id = req.params.id
	//
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
app.post("/users/upload_image/:id", uploader.single("avatar"), (req, res) => {
	let id = req.params.id
	let img_path = req.file
	let gcp_img_url = "";
	// 認証する必要あるけど ...
	if ( img_path ) {
		// console.log(req.file.path, req.file.originalname)
		let file_name = id + "/" + req.file.path.split("/")[1]
		google_cs.upload_file(req.file.path, file_name)
		gcp_img_url = "https://storage.googleapis.com/tweet_storage_0218/" + file_name
		let user_data = {
			"image_url": gcp_img_url,
			"email": req.cookies["email"],
			"cookietext": req.cookies["cookietext"]
		}
		tweet_db.update_user_image_data(db, user_data, id, res)
	} else {
		res.status(200).json({
			"status": "error",
			"message": "file not uploaded."
		})
	}
})
app.post("/users/password_update/:id", cors(corsOptions), (req, res) => {
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
app.post("/users/sign_in", cors(corsOptions), (req, res) => {
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
app.post("/users/delete/:id", cors(corsOptions), (req, res) => {
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
app.get("/tweets", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let offset = req.query.offset
	if (offset == undefined) {
		offset = 1
	} else {
		offset = parseInt(offset)
	}
	console.log("Offset ", offset)
	tweet_db.select_all_tweet(db, user_data, offset, res)
})
app.get("/tweets/:id", cors(corsOptions), (req, res) => {
	let tweet_id = req.params.id
	tweet_db.select_id_tweet(db, tweet_id, res)
})
app.post("/tweets", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_data = {
		"content": req.body.content
	}
	tweet_db.create_tweet(db, tweet_data, user_data, res)
})
app.post("/tweets/delete/:id", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.params.id
	let tweet_data = {"id": tweet_id}
	tweet_db.delete_tweet(db, tweet_data, user_data, res)
})
app.get("/users/:id/tweets", cors(corsOptions), (req, res) => {
	let user_id = req.params.id
	tweet_db.select_user_tweets(db, user_id, res)
})
app.get("/tweets_users", cors(corsOptions), (req, res) => {
	let tweet_ids_json = req.query.tweet_ids;
	let tweet_ids;
	try{
		tweet_ids = JSON.parse(tweet_ids_json);
	} catch(e) {
		tweet_ids = [0]
	}
	tweet_db.select_users_id_from_tweets(db, tweet_ids, res)
})

// Reply
app.post("/reply", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.body.tweet_id
	let tweet_data = {
		"content": req.body.content
	}
	tweet_db.create_reply(db, tweet_data, tweet_id, user_data, res)
})

app.get("/tweets/:id/reply", cors(corsOptions), (req, res) => {
	let tweet_id = req.params.id
	tweet_db.select_tweet_reply(db, tweet_id, res)
})

// Rwtweet
app.post("/retweet", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.body.tweet_id
	tweet_db.create_retweet(db, tweet_id, user_data, res)
})
app.get("/tweets/:id/retweet", cors(corsOptions), (req, res) => {
	let tweet_id = req.params.id
	tweet_db.select_retweet_from_tweet(db, tweet_id, res)
})
app.post("/tweets/:id/cancel_retweet", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.params.id
	tweet_db.delete_retweet_from_tweet(db, tweet_id, user_data, res)
})
app.get("/tweets/:id/original_retweet", cors(corsOptions), (req, res) => {
	let tweet_id = req.params.id
	tweet_db.select_original_retweet(db, tweet_id, res)
})

// User follow relations
app.post("/follow/:id", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let user_id = req.params.id;
	tweet_db.create_user_follow_relation(db, user_id, user_data, res);
})
app.post("/unfollow/:id", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let user_id = req.params.id;
	tweet_db.remove_user_follow_relation(db, user_id, user_data, res);
})
app.get("/users/:id/follow", cors(corsOptions), (req, res) => {
	let user_id = req.params.id;
	tweet_db.select_to_user_follow_by_user_id(db, user_id, res)
})
app.get("/users/:id/following", cors(corsOptions), (req, res) => {
	let user_id = req.params.id;
	tweet_db.select_from_user_follow_by_user_id(db, user_id, res)
})

// Likes
app.post("/tweets/:id/like", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.params.id
	tweet_db.create_like(db, tweet_id, user_data, res)
})
app.post("/tweets/:id/unlike", cors(corsOptions), (req, res) => {
	let user_data = {
		"email": req.cookies["email"],
		"cookietext": req.cookies["cookietext"]
	}
	let tweet_id = req.params.id
	tweet_db.remove_like(db, tweet_id, user_data, res)
})
app.get("/tweets/:id/like", cors(corsOptions), (req, res) => {
	let tweet_id = req.params.id
	tweet_db.select_all_likes(db, tweet_id, res)
})

// Search
app.get('/search/:keyword', cors(corsOptions), (req, res) => {
	let gcp_api_key = process.env.GCP_API_KEY;
	let keyword = req.params.keyword
	keyword 	= keyword.replace(/\'/gi, "");
	let gcp_request_url = "https://www.googleapis.com/customsearch/v1?key=" + gcp_api_key + "&cx=51356a11eee1142c3&q=" + keyword
	let response_result;
	(async() => {
		try {
			let response = await got(gcp_request_url)
			response_result = response.body
		} catch(error) {
			console.log(error)
		}
	})()
	.then(function(){
		res.send({search_result: response_result})
	})
})
app.get("/page_url", cors(corsOptions), (req, res) => {
	let url = req.query.url;
	let response_result;
	(async() => {
		try{
			let response = await got(url)
			response_result = response.body
		} catch(error) {
			console.log(error)
		}
	})()
	.then(function(){
		res.send({html_content: response_result})
	})
})


