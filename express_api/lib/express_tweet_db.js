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

function return_error(err, res) {
	res.status(400).json({
		"status": "error",
		"message": err.message
	})
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
				return_error(err, res)
			} else {
				let fixed_rows = []
				rows.forEach(function(item){
					fixed_rows.push({
						"id": item["id"],
						"firstname": item["firstname"],
						"lastname": item["lastname"],
						"description": item["description"],
						"avatar_image_url": item["avatar_image_url"],
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
				return_error(err, res)
			} else {
				if ( row != undefined) {
					let fixed_row = {
						"id": row["id"],
						"firstname": row["firstname"],
						"lastname": row["lastname"],
						"description": row["description"],
						"avatar_image_url": row["avatar_image_url"],
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

// 
function select_cookie_user(db, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE cookietext = ? AND email = ?", user_data["cookietext"], user_data["email"], (err, row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else {
				console.log(row)
				if (row != undefined){
					let fixed_row = {
						"id": row["id"],
						"firstname": row["firstname"],
						"lastname": row["lastname"],
						"description": row["description"],
						"avatar_image_url": row["avatar_image_url"],
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
			return_error(err, res)
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
							return_error(err, res)
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

function update_user_image_data(db, user_data, user_id, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE id = ? AND email = ? AND cookietext = ?;", user_id, user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined) {
					const update_user_state_normal = db.prepare("UPDATE USERS SET avatar_image_url = ? WHERE id = ? AND cookietext = ?;")
					update_user_state_normal.run(user_data["image_url"], row["id"], user_data["cookietext"], (err, result) => {
						if (err) {
							console.log(err)
							return_error(err, res)
						} else {
							console.log(update_user_state_normal.changes)
							// res.status(200).json({
							// 	"status": "ok",
							// 	"changes": update_user_state_normal.changes
							// })
							// すごい渋い ...
							res.redirect("http://localhost:3000/users/" + user_id)
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
			return_error(err, res)
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
				return_error(err, res)
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
			return_error(err, res)
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

function select_all_tweet(db, user_data, offset, res) {
	// cookie 認証必要
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE cookietext = ? AND email = ?", user_data["cookietext"], user_data["email"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined){
					db.all("SELECT * FROM USER_FOLLOW_RELATIONS WHERE from_user_id = ?", row["id"], (err, ufr_rows) => {
						console.log(ufr_rows)
						let offset_num = (offset-1) * 10
						if (err) {
							console.log(err)
							return_error(err, res)
						} else if (ufr_rows == undefined) {
							db.all("SELECT * FROM TWEETS WHERE user_id = ? AND is_reply = 0 ORDER BY created_at DESC LIMIT 10 OFFSET ?;", row["id"], offset_num, (err, rows) => {
								if (err) {
									console.log(err)
									return_error(err, res)
								} else {
									console.log(rows)
									let fixed_rows = []
									rows.forEach(function(t_row){
										let fixed_row = {
											"id": t_row["id"],
											"content": t_row["content"],
											"user_id": t_row["user_id"],
											"is_retweet": row["is_retweet"],
											"created_at": t_row["created_at"]
										}
										fixed_rows.push(fixed_row)
									})
									res.status(200).json({
										"status": "ok",
										"tweets": fixed_rows
									})
								}
							});
						} else if (ufr_rows != undefined) {
							let sql_where_ufr_id = row["id"] + ","
							ufr_rows.forEach(function(ufr_row){
								sql_where_ufr_id += ufr_row["to_user_id"] + ","
							})
							let offset_num = (offset-1) * 10
							sql_where_ufr_id = sql_where_ufr_id.slice(0, sql_where_ufr_id.length-1)
							let select_tweets_where_ufr_state = "SELECT * FROM TWEETS WHERE user_id in (" + sql_where_ufr_id + ") AND is_reply = 0 ORDER BY created_at DESC LIMIT 10 OFFSET ?;"
							console.log(select_tweets_where_ufr_state)
							db.all(select_tweets_where_ufr_state, offset_num, (err, rows) => {
								if (err) {
									console.log(err)
									return_error(err, res)
								} else {
									console.log(rows)
									let fixed_rows = []
									rows.forEach(function(t_row){
										let fixed_row = {
											"id": t_row["id"],
											"content": t_row["content"],
											"user_id": t_row["user_id"],
											"is_retweet": row["is_retweet"],
											"created_at": t_row["created_at"]
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
					})
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
				return_error(err, res)
			} else {
				console.log(row)
				if ( row != undefined ) {
					let tweet_data = {
						"id": row["id"],
						"content": row["content"],
						"user_id": row["user_id"],
						"is_retweet": row["is_retweet"],
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
	db.all("SELECT * FROM TWEETS WHERE user_id = ? AND is_reply = 0 ORDER BY created_at DESC;", user_id, (err, rows) => {
		if (err) {
			console.log(err)
			return_error(err, res)
		} else {
			let fixed_rows = []
			rows.forEach(function(row){
				fixed_row = {
					"id": row["id"],
					"content": row["content"],
					"user_id": row["user_id"],
					"is_retweet": row["is_retweet"],
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

function select_users_id_from_tweets(db, tweet_array, res){
	if (Array.isArray(tweet_array) != true) {
		res.status(400).json({
			"status": "input error",
			"message": "input must be Array."
		})
	} else {
		let tweet_array_in = "";
		tweet_array.forEach(function(item){
			tweet_array_in += item + ","
		})
		tweet_array_in = tweet_array.slice(0, tweet_array_in.length-1)
		let user_id_state = "SELECT USER_ID FROM TWEETS WHERE ID IN (" + tweet_array_in + ");"
		db.all(user_id_state, (err, results) => {
			if (err) {
				console.log(err)
				return_error(err);
			} else {
				res.status(200).json({
					"status": "ok",
					"user_id": results
				})
			}
		})
	}
}

function create_tweet(db, tweet_data, user_data, res){
	// cookie 認証必要
	db.serialize(() => {
		//
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else {
				if (row != undefined) {
					const create_tweet_state = db.prepare("INSERT INTO TWEETS(user_id, content) VALUES(?, ?);");
					create_tweet_state.run(row["id"], tweet_data["content"], (err, result) => {
						if (err) {
							console.log(err)
							return_error(err, res)
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
				return_error(err, res)
			} else {
				if (row != undefined) {
					const delete_tweet_state = db.prepare("DELETE FROM TWEETS WHERE id = ? AND user_id = ?")
					delete_tweet_state.run(tweet_data["id"], row["id"], (err, result) => {
						if (err) {
							console.log(err)
							return_error(err, res)
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

// Reply
function create_reply(db, tweet_data, tweet_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else {
				if (row != undefined){
					const insert_reply_state = db.prepare("INSERT INTO TWEETS(user_id, content, is_reply) VALUES(?, ?, ?)")
					insert_reply_state.run(row["id"], tweet_data["content"], tweet_id, (err, result) => {
						if (err) {
							console.log(err)
							return_error(err, res)
						}
						console.log(insert_reply_state.lastID)
						res.status(200).json({
							"status": "ok",
							"lastID": insert_reply_state.lastID
						})
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

function select_tweet_reply(db, tweet_id, res){
	// db.serialize いらないかも ... ?
	db.all("SELECT * FROM TWEETS WHERE is_reply = ?;", tweet_id, (err, rows) => {
		if (err) {
			console.log(err)
			return_error(err, res)
		} else {
			let reply_rows = []
			rows.forEach(function(row){
				let reply_row = {
					"id": row["id"],
					"content": row["content"],
					"user_id": row["user_id"],
					"is_retweet": row["is_retweet"],
					"created_at": row["created_at"]
				}
				reply_rows.push(reply_row)
			})
			res.status(200).json({
				"status": "ok",
				"replys": reply_rows
			})
		}
	})
}

// Retweet
function create_retweet(db, tweet_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, user_row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else if ( user_row != undefined ) {
				db.get("SELECT * FROM TWEETS WHERE id = ?", tweet_id, (err, t_row) => {
					if (err) {
						console.log(err)
						return_error(err, res)
					} else if (t_row == undefined) {
						res.status(200).json({
							"status": "tweet not found error",
							"message": "tweet not found."
						})
					} else {
						let retweet_tweet_id = tweet_id;
						const select_original_retweet_state = "SELECT * FROM TWEETS WHERE id = ?;"
						db.get(select_original_retweet_state, t_row["is_retweet"], (error, rt_row) => {
							if (err) {
								console.log(err)
								return_error(err, res)
							} else if ( t_row["is_retweet"] == 0 ) {
								retweet_tweet_id = tweet_id
							} else if (rt_row == undefined) {
								retweet_tweet_id = tweet_id
							} else {
								retweet_tweet_id = rt_row["id"]
							}
							//
							const insert_retweet_state = db.prepare("INSERT INTO TWEETS(content, user_id, is_retweet) VALUES(?, ?, ?);")
							insert_retweet_state.run(t_row["content"], user_row["id"], retweet_tweet_id, (err, result) => {
								if (err) {
									return_error(err, res)
								} else {
									res.status(200).json({
										"status": "ok",
										"lastID": insert_retweet_state.lastID
									})
								}
							})
						})
					}
				})
			} else {
				console.log("user authentification error")
				res.status(200).json({
					"status": "error",
					"message": "user authentification failed."
				})
			}
		})
	})
}

function select_retweet_from_tweet(db, tweet_id, res){
	db.serialize(() => {
		db.all("SELECT * FROM TWEETS WHERE is_retweet = ?", tweet_id, (err, rows) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else if ( rows == undefined ) {
				res.status(200).json({
					"status": "ok",
					"retweets": []
				})
			} else {
				let fixed_tweets = []
				rows.forEach(function(row){
					fixed_tweets.push(row["id"])
				})
				res.status(200).json({
					"status": "ok",
					"retweets": fixed_tweets
				})
			}
		})
	})
}

function delete_retweet_from_tweet(db, tweet_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				return_error(err, res)
			} else if ( row != undefined ) {
				const delete_retweet_state = db.prepare("DELETE FROM TWEETS WHERE user_id = ? AND is_retweet = ?;")
				delete_retweet_state.run(row["id"], tweet_id, (err, result) => {
					if (err) {
						return_error(err, res)
					} else {
						res.status(200).json({
							"status": "ok",
							"changes": delete_retweet_state.changes
						})
					}
				})
			} else {
				console.log("user authentification error")
				res.status(200).json({
					"status": "error",
					"message": "user authentification failed."
				})
			}
		})
	})
}

function select_original_retweet(db, retweet_id, res){
	db.serialize(() => {
		db.get("SELECT * FROM TWEETS WHERE id = ?;", retweet_id, (err, row) => {
			if (err) {
				return_error(err, res)
			} else {
				if (row == undefined) {
					res.status(200).json({
						"status": "ok",
						"lastID": 0
					})
				} else {
					let original_retweet_id = row["is_retweet"]
					let original_tweet_id = row["id"]
					let while_counter = 0
					if (original_retweet_id != 0){
						db.get("SELECT * FROM TWEETS WHERE id = ?", original_retweet_id, (err, t_row) => {
							if (err) {
								return_error(err, res)
							} else {
								original_retweet_id = t_row["is_retweet"]
								original_tweet_id = t_row["id"]
								console.log(t_row["id"])
								res.status(200).json({
									"status": "ok",
									"lastID": original_tweet_id
								})
							}
						})
					} else {
						res.status(200).json({
							"status": "ok",
							"lastID": original_tweet_id
						})
					}
				}
			}
		})
	})
}

// 複数カラム 関係 テスト用
function get_tweets_from_user_email(db, user_data){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ?", user_data["email"], (err, row) => {
			db.get("SELECT * FROM TWEETS WHERE user_id = ? AND is_reply = 0", row["id"], (err, t_row) => {
				console.log(t_row)
			})
		})
	})
}

function get_tweets_from_user_id(db, user_id){
	db.all("SELECT * FROM TWEETS WHERE user_id = ? AND is_reply = 0", user_id, (err, rows) => {
		if (err) {
			console.log(err)
		} else {
			console.log(rows)
		}
	})
}

// User Follow Relations

function create_user_follow_relation(db, user_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, user_row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else if (user_row == undefined) {
				console.log("User not login.")
				res.status(200).json({
					"status": "authentification error",
					"message": "user authentification failed"
				})
			} else if (user_id == user_row["id"]){
				console.log("User cannot follow identical user.")
				res.status(200).json({
					"status": "user identical error",
					"message": "follow user is identical..."
				})
			} else {
				db.get("SELECT * FROM USER_FOLLOW_RELATIONS WHERE from_user_id = ? AND to_user_id = ?;", user_row["id"], user_id, (err, ufr_row) => {
					if (err) {
						console.log(err)
						return_error(err, res)
					} else {
						if (ufr_row != undefined) {
							res.status(200).json({
								"status": "follow exists error",
								"message": "follow already exists."
							})
						} else {
							let create_user_follow_state = db.prepare("INSERT INTO USER_FOLLOW_RELATIONS(to_user_id, from_user_id) VALUES(?, ?);")
							create_user_follow_state.run(user_id, user_row["id"], (err, result) => {
								if (err){
									console.log(err)
									return_error(err, res)
								} else {
									console.log(create_user_follow_state.lastID)
									res.status(200).json({
										"status": "ok",
										"lastID": create_user_follow_state.lastID
									})
								}
							})
						}
					}
				})
			}
		})
	})
}

function remove_user_follow_relation(db, user_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, user_row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else {
				if (user_row == undefined) {
					res.status(200).json({
						"status": "authentification error",
						"message": "user authentification failed"
					})
				} else {
					let delete_user_follow_state = db.prepare("DELETE FROM USER_FOLLOW_RELATIONS WHERE to_user_id = ? AND from_user_id = ?;")
					delete_user_follow_state.run(user_id, user_row["id"], (err, result) => {
						if (err) {
							return_error(err, res)
						} else {
							console.log(delete_user_follow_state.changes)
							res.status(200).json({
								"status": "ok",
								"changes": delete_user_follow_state.changes
							})
						}
					})
				}
			}
		})
	})
}

function select_to_user_follow_by_user_id(db, user_id, res){
	db.serialize(() => {
		db.all("SELECT * FROM USER_FOLLOW_RELATIONS WHERE to_user_id = ?", user_id, (err, rows) => {
			if (err) {
				return_error(err, res)
			} else {
				let id_rows = ""
				rows.forEach(function(row){
					id_rows += row["from_user_id"] + ","
				})
				id_rows = id_rows.slice(0, id_rows.length-1)
				let select_all_user_state = "SELECT * FROM USERS WHERE id in (" + id_rows + ");"
				db.all(select_all_user_state, (err, user_rows) => {
					if (err) {
						console.log(err)
						return_error(err, res)
					} else {
						let fixed_user_rows = []
						user_rows.forEach(function(user_row){
							let fixed_user_row = {
								"id": user_row["id"],
								"lastname": user_row["lastname"],
								"firstname": user_row["firstname"],
								"description": user_row["description"],
								"avatar_image_url": user_row["avatar_image_url"],
								"created_at": user_row["created_at"]
							}
							fixed_user_rows.push(fixed_user_row)
						})
						res.status(200).json({
							"status": "ok",
							"users": fixed_user_rows
						})
					}
				})
			}
		})
	})
}

function select_from_user_follow_by_user_id(db, user_id, res){
	db.serialize(() => {
		db.all("SELECT * FROM USER_FOLLOW_RELATIONS WHERE from_user_id = ?", user_id, (err, rows) => {
			if (err) {
				return_error(err, res)
			} else {
				let id_rows = ""
				rows.forEach(function(row){
					id_rows += row["to_user_id"] + ","
				});
				id_rows = id_rows.slice(0, id_rows.length-1)
				let select_all_user_state = "SELECT * FROM USERS WHERE id in (" + id_rows + ");"
				db.all(select_all_user_state, (err, user_rows) => {
					if (err) {
						console.log(err)
						return_error(err, res)
					} else {
						let fixed_user_rows = []
						user_rows.forEach(function(user_row){
							let fixed_user_row = {
								"id": user_row["id"],
								"lastname": user_row["lastname"],
								"firstname": user_row["firstname"],
								"description": user_row["description"],
								"avatar_image_url": user_row["avatar_image_url"],
								"created_at": user_row["created_at"]
							}
							fixed_user_rows.push(fixed_user_row)
						})
						res.status(200).json({
							"status": "ok",
							"users": fixed_user_rows
						})
					}
				})
			}
		})
	})
}

// Likes
function create_like(db, tweet_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else {
				if (row != undefined){
					//
					const check_like_state = "SELECT * FROM LIKES WHERE tweet_id = ? AND user_id = ?;"
					db.get(check_like_state, tweet_id, row["id"], (err, l_row) => {
						if (err) {
							console.log(err)
							return_error(err, res)
						} else if ( l_row == undefined ) {
							const insert_like_state = db.prepare("INSERT INTO LIKES(tweet_id, user_id) VALUES(?, ?)");
							insert_like_state.run(tweet_id, row["id"], (err, result) => {
								if (err) {
									console.log(err)
									return_error(err, res)
								} else {
									res.status(200).json({
										"status": "ok",
										"lastID": insert_like_state.lastID
									})
								}
							})
						} else {
							console.log("data is already exist")
							res.status(200).json({
								"status": "data already exist error",
								"message": "data already exist"
							})
						}
					})
				} else {
					console.log("user authentification error")
					res.status(200).json({
						"status": "user authentification error",
						"message": "user authentification failed..."
					})
				}
			}
		})
	})
}

function remove_like(db, tweet_id, user_data, res){
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else if (row != undefined){
				const delete_like_state = db.prepare("DELETE FROM LIKES WHERE tweet_id = ? AND user_id = ?")
				delete_like_state.run(tweet_id, row["id"], (err, result) => {
					if (err) {
						console.log(err)
						return_error(err, res)
					} else {
						console.log(delete_like_state.changes)
						res.status(200).json({
							"status": "ok",
							"changes": delete_like_state.changes
						})
					}
				})
			} else {
				console.log("user authentification error")
				res.status(200).json({
					"status": "user authentification error",
					"message": "user authentification failed..."
				})
			}
		})
	})
}

function select_all_likes(db, tweet_id, res){
	db.serialize(() => {
		db.all("SELECT * FROM LIKES WHERE tweet_id = ?", tweet_id, (err, rows) => {
			if (err) {
				console.log(err)
				return_error(err, res)
			} else {
				let user_where_sql = ""
				rows.forEach(function(row) {
					user_where_sql += row["user_id"] + ","
				})
				user_where_sql = user_where_sql.slice(0, user_where_sql.length-1)
				let select_user_state = "SELECT * FROM USERS WHERE id IN (" + user_where_sql + ");"
				db.all(select_user_state, (err, user_rows) => {
					if (err) {
						console.log(err)
						return_error(err, res)
					} else {
						let fixed_user_rows = []
						user_rows.forEach(function(user_row){
							let fixed_user_row = {
								"id": user_row["id"],
								"lastname": user_row["lastname"],
								"firstname": user_row["firstname"],
								"description": user_row["description"],
								"avatar_image_url": user_row["avatar_image_url"],
								"created_at": user_row["created_at"]
							}
							fixed_user_rows.push(fixed_user_row)
						})
						res.status(200).json({
							"status": "ok",
							"users": fixed_user_rows
						})
					}
				})
			}
		})
	})
}

module.exports.initialize_db = initialize_db;
module.exports.md5base64 = md5base64;
// users
module.exports.select_all_user = select_all_user;
module.exports.select_id_user = select_id_user;
module.exports.select_cookie_user = select_cookie_user;
module.exports.create_user = create_user;
module.exports.update_user_normal_data = update_user_normal_data;
module.exports.update_user_image_data = update_user_image_data;
module.exports.update_user_password_data = update_user_password_data;
module.exports.update_user_cookie_data = update_user_cookie_data;
module.exports.delete_user = delete_user;
module.exports.select_user_tweets = select_user_tweets;
// tweets
module.exports.select_all_tweet = select_all_tweet;
module.exports.select_id_tweet = select_id_tweet
module.exports.create_tweet = create_tweet;
module.exports.delete_tweet = delete_tweet;
module.exports.get_tweets_from_user_id = get_tweets_from_user_id;
module.exports.select_users_id_from_tweets = select_users_id_from_tweets;
// Tweets Reply
module.exports.create_reply = create_reply;
module.exports.select_tweet_reply = select_tweet_reply;
// Tweets Retweet
module.exports.create_retweet = create_retweet;
module.exports.select_retweet_from_tweet = select_retweet_from_tweet;
module.exports.delete_retweet_from_tweet = delete_retweet_from_tweet;
module.exports.select_original_retweet = select_original_retweet;
// user_follow_relations
module.exports.create_user_follow_relation = create_user_follow_relation;
module.exports.remove_user_follow_relation = remove_user_follow_relation;
module.exports.select_to_user_follow_by_user_id = select_to_user_follow_by_user_id;
module.exports.select_from_user_follow_by_user_id = select_from_user_follow_by_user_id;
// like
module.exports.create_like = create_like;
module.exports.remove_like = remove_like;
module.exports.select_all_likes = select_all_likes;



