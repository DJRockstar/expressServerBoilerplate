require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./logger");
const uuid = require("uuid/v4");

const app = express();
app.use(express.json());

const morganOption = process.env.NODE_ENV === "production" ? "tiny" : "common";

const bookmarks = [{ id: 1, link: "www.google.com", title: "Google" }];

//middleware to validate the token
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || apiToken !== authToken) {
    logger.error(`Unauthorized request to path ${req.path}`);
    return res.status(401).json({ error: "Unauthorized Request" });
  }
  next();
});

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello there, welcome to the BookMark Server!!");
}); //Placeholder text

app.get("/bookmarks", (req, res) => {
  res.json(bookmarks);
});

app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id == id);
  if (!bookmark) {
    logger.error(`Card with given ID ${id} is not found`);
    res.status(404).send("Bookmark not found");
  }
  res.json(bookmark);
});

app.post("/bookmarks", (req, res) => {
  console.log(req.body);
  const { link, title } = req.body;
  if (!link) {
    logger.error("Link is required");
    return res.status(400).send("Invalid Data");
  }
  if (!title) {
    logger.error("Title is required");
    return res.status(400).send("Invalid Data");
  }
  const id = uuid();
  const bookmark = {
    id,
    link,
    title
  };
  bookmarks.push(bookmark);
  logger.info(`Card with id ${id} created`);
  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json(bookmark);
});

app.delete("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id == id);
  bookmarks.splice(bookmark, 1);
  logger.info(`Card with given ID ${id} has been deleted`);
  res.status(204).end();
});
//===============================
module.exports = app;
