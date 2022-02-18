const { syncAndSeed } = require("./db");
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false })); // need this middleware for req.body -- gives us JSON --POST/PUT only

app.use(require("method-override")("_method")); // this middleware we need for PUT and DELETE routes

app.use("/dogs", require("./dogs.routes"));

//redirect route
app.get("/", (req, res) => {
  res.redirect("/dogs");
});

// Run seedAndSync and listen with express
const start = async () => {
  try {
    await syncAndSeed();
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
