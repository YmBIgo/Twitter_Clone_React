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

const db = initialize_db("./db/express_api.db")
