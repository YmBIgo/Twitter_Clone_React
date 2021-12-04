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

// User Table

function create_user_table_ver1(db) {
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

// Tweets Table

function create_tweet_table_ver1(db) {
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

/*
const db = initialize_db("./db/express_api.db")
create_user_table_ver1(db)
*/