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
			cookietext VARCHAR(32) DEFAULT 'gGnUDxRZOFIgKa4Cp0j6+Q==', \
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

function select_all_user(db){
	db.all("SELECT * FROM USERS;", [], (err, rows) => {
		if (err) {
			console.log(err)
		} else {
			console.log(rows)
		}
	})
}

function select_id_user(db, user_id){
	db.get("SELECT * FROM USERS WHERE id = ?;", user_id, (err, row) => {
		if (err) {
			console.log(err)
		} else {
			console.log(row)
		}
	})
}

function select_cookie_user(db, cookie, email){
	db.get("SELECT * FROM USERS WHERE cookietext = ? AND email = ?", cookie, email, (err, row) => {
		if (err) {
			console.log(err)
		} else {
			console.log(row)
		}
	})
}

function create_user(db, user_data){
	// cookietext も INSERT INTO する
	const create_user_state = db.prepare("INSERT INTO USERS(firstname, lastname, email, password, cookietext) VALUES(?,?,?,?,?);")
	create_user_state.run(user_data["firstname"], user_data["lastname"], user_data["email"], user_data["password"], user_data["cookietext"], (err, result) => {
		if (err) {
			console.log(err);
		} else {
			console.log(create_user_state.lastID);
		}
	})
}

function update_user_normal_data(db, user_data, user_id) {
	db.serialize(() => {
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined) {
					const update_user_state_normal = db.prepare("UPDATE USERS SET lastname = ?, firstname = ?, description = ? WHERE id = ?;")
					update_user_state_normal.run(user_data["lastname"], user_data["firstname"], user_data["description"], user_id, (err, result) => {
						if (err) {
							console.log(err)
						} else {
							console.log(update_user_state_normal.changes)
						}
					})
				} else {
					console.log("user authentification failed")
				}
			}
		})
	})
}

function update_user_confidential_data(db, user_data, new_user_data, user_id){
	const update_user_state_confidential = db.prepare("UPDATE USERS SET email = ?, password = ? WHERE email = ? AND password = ? AND id = ?;");
	update_user_state_confidential.run(new_user_data["email"], new_user_data["password"], user_data["email"], user_data["password"], user_id, (err, result) => {
		if (err) {
			console.log(err)
		} else {
			console.log(update_user_state_confidential.changes)
		}
	})
}

function update_user_cookie_data(db, user_data, user_id) {
	// user_sign_in 後 と user_sign_up 後 を想定。
	const update_user_state_cookie = db.prepare("UPDATE USERS SET cookietext = ? WHERE id = ? AND email = ? AND password = ?;");
	update_user_state_cookie.run(user_data["cookietext"], user_data["email"], user_data["password"], user_id, (err, result) => {
		if (err) {
			console.log(err)
		} else {
			console.log(update_user_state_cookie.changes)
		}
	})
}

function delete_user(db, user_data, user_id) {
	const delete_user_state = db.prepare("DELETE FROM USERS WHERE id = ? AND email = ? AND password = ?;")
	delete_user_state.run(user_id, user_data["email"], user_data["password"], (err, result) => {
		if (err) {
			console.log(err)
		} else {
			console.log(delete_user_state.changes)
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

function select_all_tweet(db, user_id, user_data) {
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
						} else {
							console.log(rows)
						}
					});
				} else {
					console.log("user authentification failed...")
				}
			}
		})
	})
}

function select_id_tweet(db, tweet_id){
	db.get("SELECT * FROM TWEETS WHERE id = ?", tweet_id, (err, row) => {
		if (err) {
			console.log(err)
		} else {
			console.log(row)
		}
	})
}

function create_tweet(db, tweet_data, user_data){
	// cookie 認証必要
	db.serialize(() => {
		//
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined) {
					const create_tweet_state = db.prepare("INSERT INTO TWEETS(user_id, content) VALUES(?, ?);");
					create_tweet_state.run(row["id"], tweet_data["content"], (err, result) => {
						if (err) {
							console.log(err)
						} else {
							console.log(create_tweet_state.lastID)
						}
					});
				} else {
					console.log("user authentification failed...")
				}
			}
		})
	})
}

function delete_tweet(db, tweet_data, user_id, user_data){
	// cookie 認証必要
	db.serialize(() => {
		//
		db.get("SELECT * FROM USERS WHERE email = ? AND cookietext = ?;", user_data["email"], user_data["cookietext"], (err, row) => {
			if (err) {
				console.log(err)
			} else {
				if (row != undefined) {
					const delete_tweet_state = db.prepare("DELETE FROM TWEETS WHERE id = ? AND user_id = ?")
					delete_tweet_state.run(tweet_data["id"], user_id, (err, result) => {
						if (err) {
							console.log(err)
						} else {
							console.log(delete_tweet_state.changes)
						}
					})
				} else {
					console.log("user authentification failed...")
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

// << User >>

const db = initialize_db("./db/express_api.db")
// create_user_table(db)
// create_tweet_table(db)

// <Create User 1>
// let new_user_password = md5base64("hellopassword")
// let new_user_cookie   = md5base64("qN5R7waX")
// console.log(new_user_password, new_user_cookie)
// let user_data_create = {"lastname": "test", "firstname": "taro", "email": "hogehoge@hoge.com", "password": new_user_password, "cookietext": new_user_cookie}
// create_user(db, user_data_create)

// <Create User 2>
// let new_user_password2 = md5base64("password123")
// let new_user_cookie2   = md5base64("P3xeYcwZ")
// console.log(new_user_password2, new_user_cookie2)
// let user_data_create2 = {"lastname": "hoge", "firstname": "ichiro", "email": "hello@hoge.com", "password": new_user_password2, "cookietext": new_user_cookie2}
// create_user(db, user_data_create2)

// <Create User 3 (delete用)>
// let new_user_password3 = md5base64("passwordhoge")
// let new_user_cookie3   = md5base64("Jq5tgdXA")
// console.log(new_user_password3, new_user_cookie3)
// let user_data_create3 = {"lastname" : "fuga", "firstname": "hanako", "email": "sample@hoge.com", "password": new_user_password3, "cookietext": new_user_cookie3}
// create_user(db, user_data_create3)

// <Update User>
// let user_data_update = {"lastname": "test", "firstname": "hanako", "description": "test", "cookietext": "eukEKUFAFEEZYPllNsbt+A==", "email": "test12345@test.com"}
// update_user_normal_data(db, user_data_update, 2)

// <Update User 2 (cookie)>
/*   password : MpQ15eZr6AmmVq8QX0JAHg== */
/*   email    : hogehoge@hoge.com */
// let user_update3_password = "MpQ15eZr6AmmVq8QX0JAHg=="
// let user_update3_email 	  = "hogehoge@hoge.com"
// let new_user_cookie  = md5base64("hellocookie")
// let user_data_cookie = {"cookietext": new_user_cookie, "password": user_update3_password, "email": user_update3_email}
// update_user_cookie_data(db, user_data_cookie, 2)

// <Update User 3 (password, email)>
/*   password : MpQ15eZr6AmmVq8QX0JAHg== */
/*   email    : hogehoge@hoge.com */
// let user_update3_password = "MpQ15eZr6AmmVq8QX0JAHg=="
// let user_update3_email 	  = "hogehoge@hoge.com"
// let user_data = {"password": user_update3_password, "email": user_update3_email}
// let user_new_data = {"password": user_update3_password, "email": "test12345@test.com"}
// update_user_confidential_data(db, user_data, user_new_data, 2)

// <Delete User 4>
/*   password : Yh9L95KYJnDRxCmIwUlaSw== */
/*   email    : sample@hoge.com */
// let user_delete_password = "Yh9L95KYJnDRxCmIwUlaSw==";
// let user_delete_email	 = "sample@hoge.com"
// let user_delete_data	 = {"email": user_delete_email, "password": user_delete_password}
// let user_id = 5 /* 変わる可能性 */
// delete_user(db, user_delete_data, user_id)

// <Get User Info And Get Tweets>
// get_tweets_from_get_user_email(db, {"email": "test@test.com"})

// get_tweets_from_user_id(db, 2)

// select_all_user(db)

// << Tweet >>
// <Select Tweet>
// select_id_tweet(db, 2)

// <Index Tweet>
// let tweet_user_data = {"cookietext":"eukEKUFAFEEZYPllNsbt+A==", "email": "test12345@test.com"}
// select_all_tweet(db, 2, tweet_user_data);

// <Create Tweet>
// let new_tweet_data = {"content": "hogehogetest1"}
// let new_tweet_user_data = {"cookietext":"eukEKUFAFEEZYPllNsbt+A==", "email": "test12345@test.com"}
// create_tweet(db, new_tweet_data, new_tweet_user_data);

// <Delete Tweet>
// let delete_tweet_user_data = {"cookietext":"eukEKUFAFEEZYPllNsbt+A==", "email": "test12345@test.com"}
// delete_tweet(db, {"id":6}, 2, delete_tweet_user_data)

