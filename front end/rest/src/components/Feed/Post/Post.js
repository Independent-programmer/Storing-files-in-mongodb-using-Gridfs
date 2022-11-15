import React from "react";

import "./Post.css";

const post = (props) => {
  console.log(props);
  return (
    <article className="post">
      <header className="post__header">
        <p>{props.pdf}</p>
      </header>

      <div className="post__actions">
        <form method="GET" action={"http://localhost:8080/posts/" + props.pdf}>
          <button>View</button>
        </form>
      </div>
    </article>
  );
};

export default post;
