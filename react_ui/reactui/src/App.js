import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import {useState, useEffect} from "react";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux"

import Users from "./Components/Users"
import User from "./Components/User"
import UserEdit from "./Components/UserEdit"
import UserCreate from "./Components/UserCreate"
import Tweets from "./Components/Tweets"
import Tweet from "./Components/Tweet"
import TweetNew from "./Components/TweetNew"
import Follow from "./Components/Follow"
import Following from "./Components/Following"

import {getCurrentUser} from "./actions"

function App() {

  const useeffect_counter = 0
  const dispatch = useDispatch();
  const currentuser = useSelector(state => state.currentuser)

  useEffect(() => {
    dispatch(getCurrentUser())
    console.log(currentuser)
  }, [useeffect_counter])

  return (
    <BrowserRouter>
      <div className="row app">
        <div className="col-3">
          <Header />
        </div>
        <div className="col-6">
          <Routes>
            <Route exact path="/" element={ <Tweets/> } />
            <Route exact path="/users" element={ <Users/> } />
            <Route exact path="/users/:id" element={ <User/> } />
            <Route exact path="/users/edit" element={ <UserEdit/> } />
            <Route exact path="/users/new" element={ <UserCreate/> } />
            <Route exact path="/tweets" element={ <Tweets/> } />
            <Route exact path="/tweets/:id" element={ <Tweet/> } />
            <Route exact path="/tweets/new" element={ <TweetNew/> } />
            <Route exact path="/users/:id/follow" element={ <Follow/> } />
            <Route exact path="/users/:id/following" element={ <Following/> } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const Header = () => {
  const useeffect_counter = 0
  const [currentuser, setCurrentuser] = useState({})

  useEffect(() => {
    getLoginData()
  }, [useeffect_counter])

  const getLoginData = () => {
    axios({
      method: "GET",
      url: "http://localhost:3002/signed_in_user",
      withCredentials: true
    }).then((response) => {
      console.log(response["data"])
      if ( response["data"]["user"] != undefined ){
        setCurrentuser(response["data"]["user"])
      } else {
        setCurrentuser({"id": 0, "avatar_image_url": "https://storage.googleapis.com/tweet_storage_0218/default/twitter.png"})
      }
    })
  }

  const userLogout = () => {
    document.cookie = "cookietext=; max-age=0";
    document.cookie = "email=; max-age=0";
    window.location.assign("/")
  }

  return(
    <nav>
      <ul className="tweet-nav">
        <li>
          { currentuser["id"] != 0 &&
            <div>
              <Link to={"/users/"+currentuser["id"]} className="tweet-nav-link-title">
                {currentuser["firstname"]} {currentuser["lastname"]}さん
              </Link>
            </div>
          }
          { currentuser["id"] == 0 &&
            <div>
              <Link to="" className="tweet-nav-link-title">
              </Link>
            </div>
          }
          <img src={currentuser["avatar_image_url"]} className="tweet-nav-link-img" />
        </li>
        <br />
        <li>
          <Link to="/tweets" className="tweet-nav-link">タイムライン</Link>
        </li>
        <li>
          <Link to="/users" className="tweet-nav-link">ユーザー一覧</Link>
        </li>
        <li>
          <Link to="/tweets/new" className="tweet-nav-link">ツイート作成</Link>
        </li>
        { currentuser["id"] != 0 &&
          <li>
            <a onClick={userLogout} className="tweet-nav-link">ログアウト</a>
          </li>
        }
      </ul>
    </nav>
  )
}

export default App;
