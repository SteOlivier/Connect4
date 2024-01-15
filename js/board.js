var board = [];
var staleBoard = true;
var imageWidth = Math.trunc((window.innerWidth)/8)-(Math.trunc((window.innerWidth)/8)%10)
var lastDrawnWidth = imageWidth;
var lastDrawnHeight = 170;
var pieceDictionary = {};
var drawThreads = 1;
var drawLoopDelay = 25;
var drawList = [];
var imageThreads = [];
var drawingProcessing = false;
var turn = 0;
const canv = document.getElementById("cnvs");
const ctx = canv.getContext("2d");

console.log("Maximum square width: " +imageWidth+ "px")
console.log(window.innerWidth)
//console.log(board);

function postBoard(gameName){
    // $.post( "/data/game/board", JSON.stringify({board: board, game_Name: gameName}), function(data) {
    //     console.log(data)
    // }).done(function(data){
    //     console.log(data)
    // });

    $.ajax({
        type: 'post',
        url: '/data/games/board',
        data: JSON.stringify({board: board, game_Name: gameName}),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (data) {
            console.log(data)
        }
    });
}

function initializeBoard(){
    board = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
    ];
    // test board
    // board = [
    //     [0,0,0,0,0,0,0],
    //     [0,0,0,2,1,0,0],
    //     [0,0,0,2,2,0,0],
    //     [0,1,1,1,2,1,0],
    //     [1,2,2,1,1,1,0],
    //     [2,2,2,1,2,2,0],
    // ];

    // board = [
    //     [0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0],
    //     [0,0,2,0,0,0,0],
    //     [1,0,2,1,2,0,0],
    // ];
}

function compareBoard(otherboard){
    let xyChangeList = [];
    for (let rowInd = 0; rowInd < board.length; rowInd++) {
        const row = board[rowInd];
        for (let colInd = 0; colInd < row.length; colInd++) {
            const cell = row[colInd];
            if (otherboard[rowInd][colInd] !== cell)
            {
                xyChangeList.push([colInd,rowInd]);
            }
        }
    }
    return xyChangeList;
}
function calculateWidth() {
    imageWidth = Math.trunc((window.innerWidth)/8)-(Math.trunc((window.innerWidth)/8)%10);
    return imageWidth;
}

function getPositionMatrix(rowIndex, columnIndex)
{
    var posMat = [];
    var startRow = rowIndex;
    if (rowIndex == 0)
    {
        posMat.push([-1,-1])
    } else {
    startRow = rowIndex-1;
    }
    while(posMat.length < 2)
    {
        var rowMat = [];
        if (columnIndex <= 0)
        {
            rowMat.push(-1);
        } else{
            rowMat.push(board[startRow][columnIndex-1])
        }
        rowMat.push(board[startRow][columnIndex]);
        posMat.push(rowMat);
        // if (rowIndex == board.length-1){
        //     posMat.push([-1,-1]);
        // }
        startRow = startRow+1;
    }
    return posMat;
}

function requiresRedraw(){
    if (calculateWidth() != lastDrawnWidth) return true;
    return staleBoard;
}

function clearBoard(divId){
    var node = document.getElementById(divId);
    if (node){
    node.innerHTML = '';
    }
}

function getBottomOpenRowIndex(colIndex)
{
    var lowestOpen = -1;
    for (let rowInd = 0; rowInd < board.length; rowInd++) {
        if (board[rowInd][colIndex] !== 0)
        {
            break;
        }
        lowestOpen = rowInd;
    }
    return lowestOpen;
}

function getRelativePosisionEvent(element) {
    element.addEventListener('mousedown', function (e) {
        // Get the target
        const target = e.target;

        // Get the bounding rectangle of target
        const rect = target.getBoundingClientRect();
        // Mouse position
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let xIndex = Math.trunc(x/imageWidth);
        let yIndex = Math.trunc(y/lastDrawnHeight);
        //let rightSide = x>(imageWidth/2);
        console.log("clicked row:" + xIndex + ' col: '+yIndex);
        console.log("x: "+x + " y: " + y);
        let rowDrawIndex = getBottomOpenRowIndex(xIndex);
        board[rowDrawIndex][xIndex] = (turn%2)+1;
        turn = turn+1;
        drawBoardPosition(xIndex,rowDrawIndex);
        console.log("row turn:" +turn);
        postBoard("NoName");
        
    });
}
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}


function arrayEqualsX(a, b) {
    var isEquall = false;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length)
    {
        if (a.length > 0 && Array.isArray(a[0]) && Array.isArray(b[0])){
            for (let index = 0; index < a.length; index++) {
                isEquall = arrayEqualsX(a[index],b[index]);
                if (isEquall == false) break;
            }
        } else {
            return a.every((val, index) => val === b[index]|| b[index]=='x');
        }
    }
    return isEquall;


}

function selectRandomPiece(pieces){
    var iRandom = Math.trunc(Math.random()*1000)%pieces.length;
    return pieces[iRandom];
}

function __drawImages() {
    drawingProcessing = true;
    if (drawList.length == 0)
    {
            drawingProcessing = false;
            return;
    }
    for (let currPos = 0; drawList.length > 0 && currPos < drawThreads; currPos++) {

        const imgProps = drawList.shift();

        imageThreads[currPos] = document.createElement("img");
        imageThreads[currPos].onload = function() {
            let factor = imageWidth/imageThreads[currPos].width;
            let imageHeight = imageThreads[currPos].height*factor;
            lastDrawnHeight = imageHeight;
            if (imgProps.clearFirst){
                ctx.clearRect(imageWidth*imgProps.iX,imageHeight*imgProps.iY, imageWidth,imageHeight);
            }
            ctx.drawImage(imageThreads[currPos],imageWidth*imgProps.iX,imageHeight*imgProps.iY,imageWidth,imageHeight);
            console.log("image drew");
            if (drawList.length == 0 || currPos+1 >= drawThreads){
                setTimeout(function () {
                    __drawImages();
                },drawLoopDelay);
            }
        }
        imageThreads[currPos].src = imgProps.src;

    }

}

function drawImage(imageSrc, iX, iY, clearFirst){
    if (!clearFirst) clearFirst = false;
    while (imageThreads.length < drawThreads)
    {
        imageThreads.push({});
    }
    drawList.push({src: imageSrc, iX: iX, iY:iY, clearFirst:clearFirst });
    if (drawingProcessing) return;
    __drawImages();

}

function drawBoardPosition(xInd, yInd){
    /// uses board to draw that posision
    let yTemp = Math.min(yInd, board.length-1);
    const topPadding = 0.1;
    const leftPadding = 0.1;

    // always draw top line if within limits
    if (!(xInd >= board[yTemp].length)){
        drawImage(selectRandomPiece(pieceDictionary['top']),xInd+leftPadding,yInd);
    }
    // always draw left line if withing y limits
    if (!(yInd >= board.length)) {
        drawImage(selectRandomPiece(pieceDictionary['left']), xInd,yInd+topPadding);
    }

    if (!(yInd >= board.length) && !(xInd >= board[yTemp].length)){
        // Save to assume x is on the board

        // Draw board item

        switch (board[yInd][xInd]) {
            case 1:
                drawImage(selectRandomPiece(pieceDictionary['black']),xInd+leftPadding,yInd+topPadding);
                break;
            case 2:
                drawImage(selectRandomPiece(pieceDictionary['red']),xInd+leftPadding,yInd+topPadding);
                break;
            default:
                break;
        }

        // //draw top +1
        // drawImage(selectRandomPiece(pieceDictionary['top']),xInd+leftPadding,yInd+1)
        // //draw left +1
        // drawImage(selectRandomPiece(pieceDictionary['left']), xInd+1,yInd+topPadding)
    }
}

function drawBoard(){
    for (let rowInd = 0; rowInd <= board.length; rowInd++) {
        lastRow = Math.min(board.length-1, rowInd);
        for (let colInd = 0; colInd < board[lastRow].length; colInd++) {
            //const val = board[lastRow][colInd];
            drawBoardPosition(colInd,rowInd);
        }
        drawBoardPosition(board[lastRow].length, rowInd);

    }
}

function initCanvas(){
    calculateWidth();
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight*1.45;
    getRelativePosisionEvent(canv)
}

