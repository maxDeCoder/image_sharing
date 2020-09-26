const express = require('express');
const path = require('path');
const app = express();
const fs = require("fs");
const busboy = require("connect-busboy");

app.use(busboy());
const port = process.env.PORT || 80;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit : '1mb'}));
app.listen(port, () => {
    console.log('listening to port : ', port);
    console.log('server started');
});

app.get('/',(req,res)=>{
    res.send("this is just a template")
});

app.post('/python/', (req,res)=>{
    console.log('new file coming in');
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        var fstream;
        var endLoc = '/images/'+filename;
        var writeDir = path.join(__dirname, endLoc);
        fstream = fs.createWriteStream(writeDir);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("saved");
        });
    });
    res.send("i got it");
})