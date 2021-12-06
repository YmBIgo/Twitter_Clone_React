import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Users from "./Components/Users"
import User from "./Components/User"
import UserEdit from "./Components/UserEdit"
import Tweets from "./Components/Tweets"
import Tweet from "./Components/Tweet"
import TweetNew from "./Components/TweetNew"
import Follow from "./Components/Follow"
import Following from "./Components/Following"

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route exact path="/" element={ <Tweets/> } />
          <Route exact path="/users" element={ <Users/> } />
          <Route exact path="/users/:id" element={ <User/> } />
          <Route exact path="/users/edit" element={ <UserEdit/> } />
          <Route exact path="/tweets" element={ <Tweets/> } />
          <Route exact path="/tweets/:id" element={ <Tweet/> } />
          <Route exact path="/tweets/new" element={ <TweetNew/> } />
          <Route exact path="/users/:id/follow" element={ <Follow/> } />
          <Route exact path="/users/:id/following" element={ <Following/> } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const Header = () => {
  return(
    <nav>
      <ul className="tweet-nav">
        <li className="tweet-nav-link">
          <Link to="/tweets">ツイート一覧</Link>
        </li>
        <li className="tweet-nav-link">
          <Link to="/users">ユーザー一覧</Link>
        </li>
        <li className="tweet-nav-link">
          <Link to="/tweets/new">ツイート作成</Link>
        </li>
      </ul>
    </nav>
  )
}

export default App;
