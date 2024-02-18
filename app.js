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
    var urlParams = getUrlAndParameters(req.headers.referer);
    
    const fs = require('fs');
    console.log(__dirname +'\\games\\'+urlParams.gameId + '\\board.json');
    fs.promises.mkdir(__dirname +'\\games\\'+urlParams.gameId.toLowerCase(), { recursive: true })
    .then(
        fs.writeFileSync(__dirname +'\\games\\'+urlParams.gameId + '\\board.json',JSON.stringify(req.body.board) )
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


const urlPartsDefinition = {
    TEXT: "text",
    PARAMETER: "parameter"
}
class UrlParts
{
    stringArray = [];
    // uses urlPartsDefinition to define what each tipe in the stringArray is
    itemDefArray = [];
    constructor(urlTemplate){
        let sections = urlTemplate.split("/");
        
        sections.forEach(uriText => {
            let parameters = uriText.split(":")
            this.stringArray.push(parameters[0]);
            this.itemDefArray.push(urlPartsDefinition.TEXT);
            if (parameters.length === 2)
            {
                this.stringArray.push(parameters[1]);
                this.itemDefArray.push(urlPartsDefinition.PARAMETER);
            } 
        });
    }

    isSameUrl(url) {
        let isSame = true;
        let lastIndexMatched = 0;
        for (let index = 0; index < this.stringArray.length; index++) {
            const textOrParameter = this.stringArray[index];
            const partDefinition = this.itemDefArray[index];
            if (partDefinition === urlPartsDefinition.PARAMETER) continue;
            let urlMatchInd = url.indexOf("/"+textOrParameter,lastIndexMatched);
            if (urlMatchInd === -1) {
                isSame = false;
                break;
            }
            lastIndexMatched = urlMatchInd; // move the position of the last matched so that it will match sequencially while ignoring parameters
        }
        return isSame;    
    }
    getParametersURL(url, checked)
    {
        // don't recheck if iaSameUrl already called
        if (!checked){
        // if not the same, return a blank version of the class expected
            if (!this.isSameUrl(url)) {
                let blankObj = {};
                for (let index = 0; index < this.itemDefArray.length; index++) {
                    const textOrParameter = this.stringArray[index];
                    const partDefinition = this.itemDefArray[index];
                    if (partDefinition === urlPartsDefinition.TEXT) continue;
                    blankObj[textOrParameter]= "";
                }
                return blankObj;
            }
        }
        let urlObj = {};
        let lastIndexMatched = 0;
        for (let index = 0; index < this.stringArray.length; index++) {
            const textOrParameter = this.stringArray[index];
            const partDefinition = this.itemDefArray[index];
            if (partDefinition === urlPartsDefinition.TEXT) {
                let urlMatchInd = url.indexOf("/"+textOrParameter,lastIndexMatched);
                if (urlMatchInd === -1) {
                    isSame = false;
                    break;
                }
                lastIndexMatched = urlMatchInd+textOrParameter.length; // move the position of the last matched so that it will match sequencially while ignoring parameters
            } else {
                let slashMatchInd = url.indexOf("/", lastIndexMatched+1); // end of url parameter
                if (slashMatchInd === -1){ //remaining part of url is the match
                    urlObj[textOrParameter] = url.slice(lastIndexMatched+1);
                    break; // should be the end, if not, well end it anyway (for safety)
                } else {
                    urlObj[textOrParameter] = url.slice(lastIndexMatched+1,slashMatchInd);
                }
                lastIndexMatched = slashMatchInd;
            }
        }
        return urlObj;
    }
}

var allGetCommands = ['/data/games/board','/data/theme-:theme/:piece','/hg-:gameId','/'];
var allGetParts = [new UrlParts(allGetCommands[0]),new UrlParts(allGetCommands[1]),new UrlParts(allGetCommands[2])];

function getUrlAndParameters(urlString){
    for (let index = 0; index < allGetParts.length; index++) {
        const urlPart = allGetParts[index];
        if (urlPart.isSameUrl(urlString))
        {
            return urlPart.getParametersURL(urlString,true);
        }
    }
    return null;
}