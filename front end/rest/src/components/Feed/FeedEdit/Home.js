import React, { Component, Fragment } from "react";

const Home = (props) => {
  const handleChange = (e) => {
    let file = e.target.files[0];
    let fileSize = file.size / 1000; // 3MB
    console.log(file.size);

    if (fileSize > 5 * 100) {
      // fileSize > 5MB then show popup message
      alert(
        `File size is too large, please upload pdf of size less than 500KB.\nSelected File Size: ${fileSize}KB only`
      );
      return;
    }
  };

  return props.editing ? (
    <Fragment>
      <div>
        <h1>File Upload</h1>
        <form
          action={"http://localhost:8080/upload/" + props.userId}
          method="POST"
          encType="multipart/form-data"
        >
          <div>
            <input type="file" name="file" id="file" onChange={handleChange} />
            <label>Choose File</label>
          </div>
          <button>Submit</button>
        </form>
        <hr />
      </div>
    </Fragment>
  ) : null;
};

export default Home;
