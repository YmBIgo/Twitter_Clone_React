import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import TweetComponent from "./TweetComponent"
import axios from "axios"
import "./CSS/Tweets.css"
import heart_dark from "./IMG/heart_dark.svg"
import heart_normal from "./IMG/heart_normal.jpg"

const Tweet = () => {
	const query = useParams();

	return(
		<div>
			<Link to="/tweets" className="btn">ツイートタイムラインに戻る</Link>
			<TweetComponent tweet_id={query.id} t_index="0" is_tweet_delete="1" is_timeline="0" />
		</div>
	)
}

export default Tweet;