const express = require('express')
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')
const port = 8080;

let Contact = require('../models/contact')

contactRoute = express();

contactRoute.post('/api/contact', (req, res) => {

    async function main() {

        let newContact = new Contact(req.body)
        newContact.save((err, newContact) => {
            if (err) console.error(err);
            res.send(newContact)
        })

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "kylethebeast@gmail.com",
                pass: ""
            }
        });

        let mailOptions = {
            from: '"Kyle-Bot 👻" <kylethebeast@gmail.com>',
            to: "jastramkyle@gmail.com",
            subject: "Somebody wants to get in contact with you!",
            text: req.body.message,
            html: `<p>email: <b>${req.body.email}</b></p>
            <p>number: <b>${req.body.number}</b></p>
            <p>from: <b>${req.body.name}</b></p>
            <p style="white-space: pre-line;">message:  <b>${req.body.message}</b></p>`
        };

        let info = await transporter.sendMail(mailOptions)

        res.status(200).send(info)
    }

    main().catch(console.error);

})

module.exports = contactRoute;
