var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var WIDTH = 1200;
var HEIGHT = 800;

var tileSize = 20;
var tileRowCount = 25;
var tileColumnCount = 40;

var boundX = 0;
var boundY = 0

var tiles = [];
for(var i = 0; i < tileColumnCount; i++){
    tiles[i] = [];
    for(var j = 0; j < tileRowCount; j++){
        tiles[i][j] = {x: i * (tileSize + 3), y: j * (tileSize + 3), state: "e"} // e for empty
    }
}

//top left
tiles[0][0].state = "s";
//bottom right tile
tiles[tileColumnCount-1][tileRowCount-1].state = "f"

function clear(){
    ctx.clearRect(0,0,WIDTH, HEIGHT);
}

function rect(x,y,w,h, state){
    if(state == "s"){
        ctx.fillStyle = "#00FF00";
    }else if(state == "f"){
        ctx.fillStyle = "#FF0000";
    }else if(state == "e"){
        ctx.fillStyle = "#AAAAAA";
    }else if(state == "w"){
        ctx.fillStyle = "#0000FF";
    }
    ctx.fillRect(x,y,w,h)
}

function draw(){
    clear();
    ctx.fillStyle = "#ff0000";
    
    //run through all the tiles
    for(i = 0; i < tileColumnCount; i++){
        for(j = 0; j < tileRowCount; j++){
            rect(tiles[i][j].x,tiles[i][j].y,tileSize,tileSize,tiles[i][j].state)
        }
    }
}

function init(){
   return setInterval(draw,10) 
}

function myMove(e){
       //offset x and y
        x = e.pageX - canvas.offsetLeft;
        y = e.pageY - canvas.offsetTop;
        for(var i = 0; i < tileColumnCount; i++){
            for(var j = 0; j < tileRowCount; j++){
                // check whether we clicked the tile
                if(i * (tileSize + 3) < x && x < i * (tileSize + 3) + tileSize && j * (tileSize + 3) < y && y < j*(tileSize + 3) + tileSize){
                    // we clicked on the center of tile
                    if(tiles[i][j].state == 'e' && (i != boundX || j != boundY)){
                        tiles[i][j].state = "w"
                        boundX = i;
                        boundY = j;
                    }
                    else if(tiles[i][j].state == 'w' && (i != boundX || j != boundY)){
                        tiles[i][j].state = "e"
                        boundX = i;
                        boundY = j;
                    }
                }

            }
        }
}

function myDown(e){
    canvas.onmousemove = myMove;
    //offset x and y
    x = e.pageX - canvas.offsetLeft;
    y = e.pageY - canvas.offsetTop;
    for(var i = 0; i < tileColumnCount; i++){
        for(var j = 0; j < tileRowCount; j++){
            // check whether we clicked the tile
            if(i * (tileSize + 3) < x && x < i * (tileSize + 3) + tileSize && j * (tileSize + 3) < y && y < j*(tileSize + 3) + tileSize){
                // we clicked on the center of tile
                if(tiles[i][j].state == 'e'){
                    tiles[i][j].state = "w"
                    boundX = i;
                    boundY = j
                }
                else if(tiles[i][j].state == 'w'){
                    tiles[i][j].state = "e"
                    boundX = i;
                    boundY = j;
                }
            }
            
        }
    }
    
}

function myUp(){
    canvas.onmousemove = null;
}

init();

canvas.onmousedown = myDown;
canvas.onmouseup = myUp
