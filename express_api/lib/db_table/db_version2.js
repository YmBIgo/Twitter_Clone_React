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

//

function add_image_url_to_users(db){
	db.run("ALTER TABLE USERS ADD COLUMN avatar_image_url TEXT DEFAULT '';", (err) => {
		if (err) {
			console.log(err)
		}
	})
	db.run("CREATE TABLE IF NOT EXISTS USER_FOLLOW_RELATIONS( \
			id INTEGER PRIMARY KEY AUTOINCREMENT, \
			to_user_id INTEGER DEFAULT 0, \
			from_user_id INTEGER DEFAULT 0, \
			created_at DATE DEFAULT CURRENT_TIMESTAMP, \
			updated_at DATE DEFAULT CURRENT_TIMESTAMP);", (err) => {
				if (err) {
					console.log(err);
				}
			})
}

// const db = initialize_db("./db/express_api.db")
// add_image_url_to_users(db)