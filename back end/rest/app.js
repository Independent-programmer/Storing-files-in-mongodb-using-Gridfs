const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Post = require("./models/post");
const User = require("./models/user");
require("dotenv").config();
const authRoutes = require("./routes/auth");

const app = express();

app.use(bodyParser.json()); // application/json

const mongouri =
  "Your URI";

try {
  mongoose.connect(mongouri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
} catch (error) {
  handleError(error);
}
process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error.message);
});

let bucket;
mongoose.connection.on("connected", () => {
  const client = mongoose.connections[0].client;
  const db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "newBucket",
  });
  console.log(bucket);
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

const storage = new GridFsStorage({
  url: mongouri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: "newBucket",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({
  storage,
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.get("/posts/:filename", (req, res) => {
  const file = bucket
    .find({
      filename: req.params.filename,
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist",
        });
      }
      bucket.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

app.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  //console.log("143", userId);

  Post.find({ creator: userId }).then((post) => {
    console.log(post);
    return res.json(post);
  });
});

app.post("/upload/:userId", upload.single("file"), (req, res, next) => {
  console.log("-------------------------------------------");
  console.log(req.params.userId);
  console.log("-------------------------------------------");
  const pdf = req.file.filename;
  let creator;
  const post = new Post({
    pdf: pdf,
    creator: req.params.userId,
  });
  console.log("POST", post);
  post
    .save()
    .then((result) => {
      return User.findById(req.params.userId);
    })
    .then((user) => {
      console.log("USER", user);
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({
          message: "Uploaded successfully!",
        })
        .redirect("/");
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});

const port = process.env.PORT || 8080;

app.listen(port, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
