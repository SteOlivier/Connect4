var testing = false;
const drawingType = {
    black: '/black',
    red: '/red',

}
var theme = 'chalkboard';
initCanvas();

if (testing) {
$.getJSON('/data/theme-'+theme+'/black', function (data) {

    let hasError = false;
    for (var prop in data) {
        //console.log(prop + ':' + data[prop]);
        if (prop === 'state'){
            if (data[prop] !== 200) hasError = true;
        }
    }
    if (hasError === false)
    {
        for (let ii = 0; ii < data['pieces'].length; ii++) {
            const element = data['pieces'][ii];
            drawImage('/'+theme+'/black/'+element,ii-(ii%2),ii%2);
            
        }
    } else {
        console.log("Error, fault in pieces");
        console.log(data);
    }
});
setTimeout(() => {
$.getJSON('/data/theme-'+theme+'/black', function (data) {

    let hasError = false;
    for (var prop in data) {
        //console.log(prop + ':' + data[prop]);
        if (prop === 'state'){
            if (data[prop] !== 200) hasError = true;
        }
    }
    if (hasError === false)
    {
        for (let ii = 0; ii < data['pieces'].length; ii++) {
            const element = data['pieces'][ii];
            drawImage('/'+theme+'/black/'+selectRandomPiece(data['pieces']),ii-(ii%2),ii%2, true);
        }
    } else {
        console.log("Error, fault in pieces");
        console.log(data);
    }
});
},3000);

} else {
    $.getJSON('/data/theme-'+theme+'/black', function (data) {
        let hasError = false;
        for (var prop in data) {
            //console.log(prop + ':' + data[prop]);
            if (prop === 'state'){
                if (data[prop] !== 200) hasError = true;
            }
        }
        pieceDictionary[data['name']] = data['pieces'];

    })
    $.getJSON('/data/theme-'+theme+'/red', function (data) {
        let hasError = false;
        for (var prop in data) {
            //console.log(prop + ':' + data[prop]);
            if (prop === 'state'){
                if (data[prop] !== 200) hasError = true;
            }
        }
        pieceDictionary[data['name']] = data['pieces'];

    })
    $.getJSON('/data/theme-'+theme+'/top', function (data) {
        let hasError = false;
        for (var prop in data) {
            //console.log(prop + ':' + data[prop]);
            if (prop === 'state'){
                if (data[prop] !== 200) hasError = true;
            }
        }
        pieceDictionary[data['name']] = data['pieces'];

    })
    $.getJSON('/data/theme-'+theme+'/left', function (data) {
        let hasError = false;
        for (var prop in data) {
            //console.log(prop + ':' + data[prop]);
            if (prop === 'state'){
                if (data[prop] !== 200) hasError = true;
            }
        }
        pieceDictionary[data['name']] = data['pieces'];

    })
    setTimeout(() => {
        console.log("pieces loaded");
        console.log(pieceDictionary);
        initializeBoard();
        drawBoard();

    },150);
}