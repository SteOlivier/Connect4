const express = require('express');
// const bodyParser = require('body-parser');  
// const urlencodedParser = bodyParser.urlencoded({ extended: true })  
const app = express();

app.use(express.static('html'))
app.use(express.static('js'))
app.use(express.static('assets'))
app.use(express.json());

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

// Get board if game exists

// New Board for game

// boardState update/save
app.post('/data/games/board', function(req, res) {

    //console.log('receiving data ...');
    //console.log('body is ',req.body);
    console.log('body is ',req.headers.referer);
    const fs = require('fs');
    console.log(__dirname +'\\games\\'+req.body.game_Name + '\\board.json');
    fs.promises.mkdir(__dirname +'\\games\\'+req.body.game_Name.toLowerCase(), { recursive: true })
    .then(
        fs.writeFileSync(__dirname +'\\games\\'+req.body.game_Name + '\\board.json',JSON.stringify(req.body.board) )
    )
    .catch(console.error);
    
    //console.log('body is ',req);
    res.send(req.body);
});

app.get('/data/games/board', function(req, res) {
    console.log('called from: ' + req.headers.referer);
    let fullReferer = req.headers.referer?.split("hg-");
    if (fullReferer.length !== 3) return;
    console.log("Game name: "+ fullReferer[2]);
    fs.readFile(__dirname+'\\games\\'+fullReferer[2]+'\\board.json', (err, data) => {
        if (!err && data) {
          // ...
        } else 
        {
            res.json()
        }
      })
    //res.json([[0,0,0,0,0,0],[0,0,0,0,0],[0,1,0,2,0]]);
})

app.listen(3000, () => {
    console.log('App is running on port 3000')
})

