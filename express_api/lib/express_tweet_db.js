const sqlite3 = require("sqlite3");
const crypto = require("crypto")

function md5base64(str){
	const md5 = crypto.createHash('md5');
	return md5.update(str, 'binary').digest('base64')
}

function initialize_db(db_path){
	const db = new sqlite3.Database(db_path)
	return db
}

// Cookie 認証は、cookietext と id (res.cookieでフロント追加) で行う

// [ Users Table ]
//
// 	ID integer
//	firstname varchar(32)
// 	lastname varchar(32)
//	email	varchar(128)
//	password varchar(32)
//	cookietext varchar(32)
//  description text
//  created_at date
//  updated_at date
//
// [ Users API ]
//  /users Index
//  /users/:id Show
//		>> cookie {cookie}
//		>> id {id}
//  /users Create [firstname, lastname, email, password]
//  /users/update/:id Update
//		>> normal_update [firstname, lastname, description]
//		>> cookie_update [cookie]
//		>> credential_update [email, password]
//  /users/delete/:id Delete
//		>> delete {email, password}

function create_user_table(db) {
	//
	db.run("DROP TABLE IF EXISTS USERS;");
	db.run("CREATE TABLE IF NOT EXISTS USERS(\
			id INTEGER PRIMARY KEY AUTOINCREMENT, \
			firstname VARCHAR(32), \
			lastname VARCHAR(32), \
			email VARCHAR(128) UNIQUE DEFAULT '', \
			password VARCHAR(32) DEFAULT '', \
			cookietext VARCHAR(32) DEFAULT '', \
			description VARCHAR(256), \
			is_admin BOOLEAN DEFAULT 0, \
			created_at DATE DEFAULT CURRENT_TIMESTAMP, \
			updated_at DATE DEFAULT CURRENT_TIMESTAMP \
			);", (err) => {
				if (err) {
					console.log(err)
				} else {
					db.run("INSERT INTO USERS(firstname, lastname, email, password) \
							VALUES(?,?,?,?)", "Test", "Taro", "test@test.com",
							"BaZxxmrv6hJMwIt26m0wuw==")
				}
			})
}

function select_all_user(db, res){
	db.serialize(() => {
		db.all("SELECT * FROM USERS;", [], (err, rows) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				let fixed_rows = []
				rows.forEach(function(item){
					fixed_rows.push({
						"id": item["id"],
						"firstname": item["firstname"],
						"lastname": item["lastname"],
						"email": item["email"],
						"description": item["description"],
						"created_at": item["created_at"]
					})
				})
				res.status(200).json({
					"status": "ok",
					"users": fixed_rows
				})
			}
		})
	})
}

function select_id_user(db, user_id, res){
	db.serialize(() => {
		//
		console.log(user_id)
		db.get("SELECT * FROM USERS WHERE id = ?;", user_id, (err, row) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				if ( row != undefined) {
					let fixed_row = {
						"id": row["id"],
						"firstname": row["firstname"],
						"lastname": row["lastname"],
						"email": row["email"],
						"description": row["description"],
						"created_at": row["created_at"]
					}
					res.status(200).json({
						"status": "ok",
						"user": fixed_row
					})
				} else {
					res.status(200).json({
						"status": "user not found error",
						"message": "user not found"
					})
				}
			}
		})
	})
}

// たぶん、いらない？
function select_cookie_user(db, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE cookietext = ? AND email = ?", user_data["cookietext"], user_data["email"], (err, row) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				console.log(row)
				if (row != undefined){
					let fixed_row = {
						"id": row["id"],
						"firstname": row["firstname"],
						"lastname": row["lastname"],
						"email": row["email"],
						"description": row["description"],
						"created_at": row["created_at"]
					}
					res.status(200).json({
						"status": "ok",
						"user": fixed_row
					})
				} else {
					res.status(200).json({
						"status": "user not signed in error",
						"message": "current user not signed in"
					})
				}
			}
		})
	})
}

function create_user(db, user_data, res){
	// cookietext も INSERT INTO する
	const create_user_state = db.prepare("INSERT INTO USERS(firstname, lastname, email, password, cookietext) VALUES(?,?,?,?,?);")
	create_user_state.run(user_data["firstname"], user_data["lastname"], user_data["email"], user_data["password"], user_data["cookietext"], (err, result) => {
		if (err) {
			console.log(err);
			res.status(400).json({
				"status": "error",
				"message": err.message
			})
		} else {
			console.log(create_user_state.lastID);
			res.status(200).json({
				"lastID": create_user_state.lastID
			})
		}
	})
}

function update_user_normal_data(db, user_data, user_id, res) {
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE id = ? AND email = ? AND cookietext = ?;", user_id, user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined) {
					const update_user_state_normal = db.prepare("UPDATE USERS SET lastname = ?, firstname = ?, description = ? WHERE id = ? AND cookietext = ?;")
					update_user_state_normal.run(user_data["lastname"], user_data["firstname"], user_data["description"], row["id"], user_data["cookietext"], (err, result) => {
						if (err) {
							console.log(err)
							res.status(400).json({
								"status": "error",
								"message": err.message
							})
						} else {
							console.log(update_user_state_normal.changes)
							res.status(200).json({
								"status": "ok",
								"changes": update_user_state_normal.changes
							})
						}
					})
				} else {
					console.log("user authentification failed")
					res.status(200).json({
						"status": "authentification error",
						"message": "user authentification failed"
					})
				}
			}
		})
	})
}

function update_user_password_data(db, user_data, new_user_data, user_id, res){
	const update_user_state_confidential = db.prepare("UPDATE USERS SET password = ? WHERE email = ? AND password = ? AND id = ?;");
	update_user_state_confidential.run(new_user_data["password"], user_data["email"], user_data["password"], user_id, (err, result) => {
		if (err) {
			console.log(err)
			res.status(400).json({
				"status": "error",
				"message": err.message
			})
		} else {
			console.log(update_user_state_confidential.changes)
			res.status(200).json({
				"status": "ok",
				"changes": update_user_state_confidential.changes
			})
		}
	})
}

function update_user_cookie_data(db, user_data, res) {
	// user_sign_in 後 と user_sign_up 後 を想定。
	db.serialize(() => {
		let cookie_original = crypto.randomBytes(8).toString("base64");
		let cookietext = md5base64(cookie_original);
		const update_user_state_cookie = db.prepare("UPDATE USERS SET cookietext = ? WHERE email = ? AND password = ?;");
		update_user_state_cookie.run(cookietext, user_data["email"], user_data["password"], (err, result) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				console.log(update_user_state_cookie.changes)
				if ( update_user_state_cookie.changes == 1 ) {
					res.cookie("email", user_data["email"])
					res.cookie("cookietext", cookietext)
				}
				res.status(200).json({
					"status": "ok",
					"changes": update_user_state_cookie.changes
				})
			}
		})
	})
}

function delete_user(db, user_data, user_id, res) {
	const delete_user_state = db.prepare("DELETE FROM USERS WHERE id = ? AND email = ? AND password = ?;")
	delete_user_state.run(user_id, user_data["email"], user_data["password"], (err, result) => {
		if (err) {
			console.log(err)
			res.status(400).json({
				"status": "error",
				"message": err.message
			})
		} else {
			console.log(delete_user_state.changes)
			if (delete_user_state.changes == 1) {
				res.cookie("email", "")
				res.cookie("cookietext", "")
			}
			res.status(200).json({
				"status": "ok",
				"changes": delete_user_state.changes
			})
		}
	})
}

// [ Tweet Table ]
// 
//  ID integer
//  user_id integer
//  content varchar(256)
//  created_at date
//  updated_at date
//
// [ Tweet API ]
//
// /tweets Index
// /tweets/:id Show
// /tweets Create [ user_id, content ]
// /tweets/delete/:id Delete

function create_tweet_table(db) {
	db.run("DROP TABLE IF EXISTS TWEETS;");
	db.run("CREATE TABLE IF NOT EXISTS TWEETS(\
			id INTEGER PRIMARY KEY AUTOINCREMENT, \
			user_id INTEGER DEFAULT 1, \
			content VARCHAR(256) DEFAULT '', \
			created_at DATE DEFAULT CURRENT_TIMESTAMP, \
			updated_at DATE DEFAULT CURRENT_TIMESTAMP\
		);", (err) => {
			if (err) {
				console.log(err)
			} else {
				db.run("INSERT INTO TWEETS(user_id, content) VALUES(?, ?)",
					1, "test tweet")
			}
		});
}

function select_all_tweet(db, user_data, res) {
	// cookie 認証必要
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE cookietext = ? AND email = ?", user_data["cookietext"], user_data["email"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined){
					db.all("SELECT * FROM TWEETS;", (err, rows) => {
						if (err) {
							console.log(err)
							res.status(400).json({
								"status": "error",
								"message": err.message
							})
						} else {
							console.log(rows)
							let fixed_rows = []
							rows.forEach(function(row){
								let fixed_row = {
									"id": row["id"],
									"content": row["content"],
									"user_id": row["user_id"],
									"created_at": row["created_at"]
								}
								fixed_rows.push(fixed_row)
							})
							res.status(200).json({
								"status": "ok",
								"tweets": fixed_rows
							})
						}
					});
				} else {
					console.log("user authentification failed...")
					res.status(200).json({
						"status": "authentification error",
						"message": "user authentification failed"
					})
				}
			}
		})
	})
}

function select_id_tweet(db, tweet_id, res){
	db.serialize(() => {
		db.get("SELECT * FROM TWEETS WHERE id = ?", tweet_id, (err, row) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				console.log(row)
				if ( row != undefined ) {
					let tweet_data = {
						"id": row["id"],
						"content": row["content"],
						"user_id": row["user_id"],
						"created_at": row["created_at"]
					}
					res.status(200).json({
						"status": "ok",
						"tweet": row
					})
				} else {
					res.status(200).json({
						"status": "not found error",
						"message": "tweet not found"
					})
				}
			}
		})
	})
}

function select_user_tweets(db, user_id, res){
	db.all("SELECT * FROM TWEETS WHERE user_id = ?", user_id, (err, rows) => {
		if (err) {
			console.log(err)
			res.status(400).json({
				"status": "error",
				"message": err.message
			})
		} else {
			let fixed_rows = []
			rows.forEach(function(row){
				fixed_row = {
					"id": row["id"],
					"content": row["content"],
					"user_id": row["user_id"],
					"created_at": row["created_at"]
				}
				fixed_rows.push(fixed_row)
			})
			res.status(200).json({
				"status": "ok",
				"tweets": fixed_rows
			})
		}
	})
}

function create_tweet(db, tweet_data, user_data, res){
	// cookie 認証必要
	db.serialize(() => {
		//
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				if (row != undefined) {
					const create_tweet_state = db.prepare("INSERT INTO TWEETS(user_id, content) VALUES(?, ?);");
					create_tweet_state.run(row["id"], tweet_data["content"], (err, result) => {
						if (err) {
							console.log(err)
							res.status(400).json({
								"status": "error",
								"message": err.message
							})
						} else {
							console.log(create_tweet_state.lastID)
							res.status(200).json({
								"status": "ok",
								"lastID": create_tweet_state.lastID
							})
						}
					});
				} else {
					console.log("user authentification failed...")
					res.status(200).json({
						"status": "user authentification error",
						"message": "user authentification failed..."
					})
				}
			}
		})
	})
}

function delete_tweet(db, tweet_data, user_data, res){
	// cookie 認証必要
	db.serialize(() => {
		//
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
				res.status(400).json({
					"status": "error",
					"message": err.message
				})
			} else {
				if (row != undefined) {
					const delete_tweet_state = db.prepare("DELETE FROM TWEETS WHERE id = ? AND user_id = ?")
					delete_tweet_state.run(tweet_data["id"], row["id"], (err, result) => {
						if (err) {
							console.log(err)
							res.status(400).json({
								"status": "error",
								"message": err.message
							})
						} else {
							console.log(delete_tweet_state.changes)
							res.status(200).json({
								"status": "ok",
								"changes": delete_tweet_state.changes
							})
						}
					})
				} else {
					console.log("user authentification failed...")
					res.status(200).json({
						"status": "user authentification error",
						"message": "user authentification failed..."
					})
				}
			}
		})
	})		
}

// 複数カラム 関係 テスト用
function get_tweets_from_user_email(db, user_data){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ?", user_data["email"], (err, row) => {
			db.get("SELECT * FROM TWEETS WHERE user_id = ?", row["id"], (err, t_row) => {
				console.log(t_row)
			})
		})
	})
}

function get_tweets_from_user_id(db, user_id){
	db.all("SELECT * FROM TWEETS WHERE user_id = ?", user_id, (err, rows) => {
		if (err) {
			console.log(err)
		} else {
			console.log(rows)
		}
	})
}

module.exports.initialize_db = initialize_db;
module.exports.md5base64 = md5base64;
module.exports.select_all_user = select_all_user;
module.exports.select_id_user = select_id_user;
module.exports.select_cookie_user = select_cookie_user;
module.exports.create_user = create_user;
module.exports.update_user_normal_data = update_user_normal_data;
module.exports.update_user_password_data = update_user_password_data;
module.exports.update_user_cookie_data = update_user_cookie_data;
module.exports.delete_user = delete_user;
module.exports.select_user_tweets = select_user_tweets;
module.exports.select_all_tweet = select_all_tweet;
module.exports.select_id_tweet = select_id_tweet
module.exports.create_tweet = create_tweet;
module.exports.delete_tweet = delete_tweet;
module.exports.get_tweets_from_user_id = get_tweets_from_user_id;

