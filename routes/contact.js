const express = require('express')
const app = express();
const port = 8080;

app.get('/api/contact', (req, res) => {
    res.status(200).send({
        name: "Johnny Test"
    })
})

app.post('/contact', (req, res) => {
    console.log(req.body)
    res.status(200).send(req.body)
})

module.exports = contactRoute;