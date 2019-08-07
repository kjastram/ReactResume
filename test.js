const {
    PythonShell
} = require('python-shell')


let options = {
    pythonPath: "/anaconda3/bin/python"
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
    console.log(returnMessage)
});