import React, { Component, Fragment } from "react";
import Post from "../../components/Feed/Post/Post";
import Loader from "../../components/Loader/Loader";
import Button from "../../components/Button/Button";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import Home from "../../components/Feed/FeedEdit/Home";
import "./Feed.css";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    this.loadPosts();
  }

  loadPosts = () => {
    fetch("http://localhost:8080/" + this.props.userId, {
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch posts.");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        this.setState({
          posts: resData.map((post) => {
            return {
              ...post,
            };
          }),
          totalPosts: resData.totalItems,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />

        <Home
          token={this.props.token}
          userId={this.props.userId}
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
        />

        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            Upload file
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Fragment>
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  pdf={post.pdf}
                />
              ))}
            </Fragment>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
