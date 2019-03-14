const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
//const mongoose = require("mongoose");
const contactRoute = require("./routes/contact");

require("dotenv").config();

const port = process.env.PORT || 8080;

const app = express();

//new method?
//app.use(express.json())

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use("/api/contact", contactRoute);

/*
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/reactresume", {
    useMongoClient: true
}, (err) => {
    if (err) console.error(err);
});
*/

app.listen(port, () => {
    console.log("Listening on " + port);
});