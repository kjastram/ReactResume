const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let contactSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    name: String,
    email: String,
    number: String,
    message: String
});

module.exports = mongoose.model("Contact", contactSchema);