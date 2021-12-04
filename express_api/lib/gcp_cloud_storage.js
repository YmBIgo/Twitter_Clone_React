const {Storage} = require("@google-cloud/storage")
const fs = require("fs")
const keyFilename = "./auth_file/storageapi-334003-300ae45f695c.json"
const bucketName = "tweet_storage_0218"

const storage = new Storage({keyFilename: keyFilename})
const bucket = storage.bucket(bucketName)

function upload_file(file_path, file_name){
	bucket.upload(file_path,
				{"destination": file_name}
	).then(res => {
		res[0].makePublic();
		fs.unlinkSync(file_path)
	})
}

function public_file(file_path){
	// storage.bucket("tweet_storage_0218").makePublic();
	const file = storage.bucket("tweet_storage_0218").file(file_path)
	file.makePublic()
	// const url = file.getSignedUrl({
	// 	action: "read",
	// 	expires: Date.now() + 60 * 60 * 24 * 365
	// })
	// https://storage.cloud.google.com/tweet_storage_0218/[file_path]
}


// upload_file("./temp_file/test1.png", "hoge/hoge.png")
// public_file("rakkokeyword_20218174578.csv")

module.exports.upload_file = upload_file;