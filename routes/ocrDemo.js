const express = require("express");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const {
    PythonShell
} = require('python-shell');
const chokidar = require('chokidar');


ocrDemoRoute = express();

ocrDemoRoute.get("/api/demo/default", (req, res) => {
    res.sendFile(path.join(__dirname, "../ocrDemo/default_output_0.json"))
})

ocrDemoRoute.get("/api/demo/template", (req, res) => {
    res.download(path.join(__dirname, "../ocrDemo/data_entry_200dpi.jpg"))
})

ocrDemoRoute.use(fileUpload());

ocrDemoRoute.post("/api/demo/upload", (req, res) => {

    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let upload = req.files.upload;

    // Use the mv() method to place the file somewhere on your server
    upload.mv('ocrDemo/samples/uploadImage.jpg', function (err) {
        if (err) return res.send(err);
    })


    let options = {
        pythonPath: "/home/bitnami/anaconda3/bin/conda"
    }

    let pyshell = new PythonShell('./ocrDemo/Task2.py', options);
    let returnMessage = []
    // sends a message to the Python script via stdin

    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message)
        returnMessage.push(message)
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
        if (err) throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
    })

    const watcher = chokidar.watch('../ocrDemo/new_output_0.json', {
        persistent: true
    })

    watcher.on('change', (path) => {
        console.log(path)
        return res.sendFile(path.join(__dirname, "../ocrDemo/new_output_0.json"))
    })
    // fs.watch(path.join(__dirname, '../ocrDemo/new_output_0.json'), {
    //     persistent: true
    // }, (event, filename) => {
    //     console.log(event)
    //     console.log(filename)
    //     return res.sendFile(path.join(__dirname, "../ocrDemo/new_output_0.json"))
    // })


})

module.exports = ocrDemoRoute;