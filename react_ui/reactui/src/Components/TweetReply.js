import React, {useEffect, useState} from "react"
import axios from "axios";
import TweetComponent from "./TweetComponent"

const TweetReply = (props) => {

	const useeffect_counter = 0
	const [replys, setReplys] = useState([])

	useEffect(() => {
		get_replys()
	}, [useeffect_counter])

	const get_replys = () => {
		let reply_api_url = "http://localhost:3002/tweets/" + props.tweet_id + "/reply"
		console.log(reply_api_url)
		axios({
			method: "GET",
			url: reply_api_url
		}).then((response) => {
			console.log(response["data"]["replys"])
			setReplys(response["data"]["replys"])
		})
	}

	const create_reply = () => {
		let create_reply_api_url = "http://localhost:3002/reply"
		let reply_content = document.getElementsByClassName("reply-textarea-input")[0].value
		axios({
			method: "POST",
			url: create_reply_api_url,
			data: {tweet_id: props.tweet_id, content: reply_content},
			withCredentials: true
		}).then((response) => {
			document.getElementsByClassName("reply-textarea-input")[0].value = ""
			get_replys()
		})
	}

	return(
		<div>
			<div className="reply-section">
				{replys.map((reply, index) => {
					return(
						<div>
							<TweetComponent tweet_id={reply.id} t_index={1+index} is_tweet_delete="1" is_timeline="1"  />
						</div>
					)
				})}
			</div>
			<div className="reply-input-section">
				<textarea className="reply-textarea-input form-control" placeholder="リプライを書こう" />
				<button className="btn btn-primary" onClick={create_reply}>リプライを返す</button>
			</div>
		</div>
	)
}

export default TweetReply;