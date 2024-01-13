const express = require('express');

const app = express();

app.use(express.static('html'))
app.use(express.static('js'))
app.use(express.static('assets'))

app.get('/', (req, res) => {
    //res.send('Hello world')
    res.sendFile(__dirname+'/html/simple.html');
});

// Request a specific game
app.get('/hg-:gameId', (req, res) => {
    //res.send('Hello world from C!')
    res.sendFile(__dirname+'/html/simple.html');
    console.log(req.params)
});

/// Request to give a list of files and names from directory (directory scanner)
app.get('/data/theme-:theme/:piece', (req, res, next) => {

    const fs = require('fs');
    let filePath = req.params.theme + '/' + req.params.piece + '/'
    fs.readdir('assets/' + filePath, {recursive: true}, function (err, fileList) {
        if (err){
            console.log("theme/directory does not exist " + req.params.theme);
            let pieces = {
                pieces: [],
                theme: req.params.theme,
                name: req.params.piece,
                state: 500
            }
            res.json(pieces);
            next();
        } else {
        
            for (let index = 0; index < fileList.length; index++) {
                fileList[index] = '/'+req.params.theme+'/'+req.params.piece+'/'+fileList[index];
            }

            let pieces = {
                pieces: fileList,
                theme: req.params.theme,
                name: req.params.piece,
                state: 200
            }
            console.log(pieces);
            res.json(pieces);
            next();
        }
    })

    console.log("json request");
});

// boardState update/save
app.post('/sample/put/data', function(req, res) {
    console.log('receiving data ...');
    console.log('body is ',req.body);
    res.send(req.body);
});

app.listen(3000, () => {
    console.log('App is running on port 3000')
})

