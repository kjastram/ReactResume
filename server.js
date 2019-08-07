const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const contactRoute = require("./routes/contact");
const ocrDemoRoute = require("./routes/ocrDemo");

require("dotenv").config();

const port = process.env.PORT || 8080;
uri = process.env.MONGODB_URI
const app = express();

//new or alternate middleware for body parsing?
//app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
mongoose.connect(uri, {
    useNewUrlParser: true
}, (err) => {
    if (err) console.error(err);
});

app.use(contactRoute);
app.use(ocrDemoRoute);

app.use(express.static(path.join(__dirname, "client", "build")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(port, () => {
    console.log("Listening on " + port);
});