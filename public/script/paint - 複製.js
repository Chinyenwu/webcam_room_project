// add socket.io
var socket = io();

// upload image
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var current = {};
var color1;
var size = 4;
var clearRect = false;
var state2;
var roomName2;
var username2;
var list2 = [];
//上傳圖片的程式
var ls = window.localStorage,
  photo = document.getElementById('uploadImage'),
  fileReader = new FileReader(),
  img = new Image(), lastImgData = ls.getItem('image');
  fileReader.onload = function (e) {
  console.log(typeof e.target.result, e.target.result instanceof Blob);
  img.src = e.target.result;
  };
  img.onload = function() {
    var rw = img.width / c.width; 
    var rh = img.height / c.height;
    
    if (rw > rh)
    {
        newh = Math.round(img.height / rw);
        neww = c.width;
    }
    else
    {
        neww = Math.round(img.width / rh);
        newh = c.height;
    }  
    var x = (c.width - neww) / 2;
    var y = (c.height - newh) / 2;  
    drawImage(img, x, y, neww, newh);
  };
  photo.addEventListener('change', function() {
    var file = this.files[0];  
    return file && fileReader.readAsDataURL(file); 
  }); 
// upload image
const color = ["red","blue","yellow","black"];
var drawmode = false;
for (let i=0 ; i<4 ; i++ )
  {
  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = color[i];
  ctx.rect(0,0+50*i,50,50);
  ctx.stroke();
  ctx.fillStyle=color[i];
  ctx.fillRect(0,0+50*i,50,50);
  }
 ctx.font = "12px Arial";
 ctx.fillStyle = "black";
 ctx.fillText("clear", 20 , 215);
 ctx.fillText("reload", 20 , 265);
window.addEventListener('load',function(){
    var canvas=document.querySelector('#myCanvas');
    canvas.addEventListener("click", getcolor, false);//選顏色
    canvas.addEventListener('mousedown',mouseDown);
	//canvas.addEventListener('mousemove',mouseMove);
    canvas.addEventListener('mouseup',mouseUp);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
});

window.addEventListener('resize', onResize, false);
onResize();
function getcolor(e) {
    var xPosition = event.pageX;
    var yPosition = event.pageY;
    var xCanvas = myCanvas.offsetLeft - myCanvas.scrollLeft + myCanvas.clientLeft;
    var yCanvas = myCanvas.offsetTop - myCanvas.scrollLeft + myCanvas.clientTop;
    //console.log(xCanvas+ "     "+yCanvas);
    let colorT;
  if ( xPosition > xCanvas && xPosition<50+xCanvas && yPosition >yCanvas && yPosition<200+yCanvas )
    {
    colorT = parseInt((yPosition-yCanvas)/50);
    //console.log(color[colorT]);
    }
  if(xPosition > xCanvas && xPosition < 60+xCanvas && yPosition > 200+yCanvas && yPosition < 250+yCanvas)
  {
    console.log('clear');
    ctx.clearRect(55, 0, 950 ,500 );
    socket.emit('pressed', 38);
	socket.on('PlayersMoving', function(key){//所有畫面一起清除
    ctx.clearRect(55, 0, 950 ,500 );
  });
  }
  if(xPosition > xCanvas && xPosition < 60+xCanvas && yPosition > 250+yCanvas && yPosition < 300+yCanvas)
  {
    var rw = img.width / c.width; 
    var rh = img.height / c.height;
    
      if (rw > rh)
        {
          newh = Math.round(img.height / rw);
          neww = c.width;
        }
      else
        {
          neww = Math.round(img.width / rh);
          newh = c.height;
        }  
      var x = (c.width - neww) / 2;
      var y = (c.height - newh) / 2;  
    drawImage(img, x, y, neww, newh);
  }
    socket.on('Room2', function(state,roomName,username){//所有畫面一起清除
		state2=state;
		roomName2=roomName;
		username2=username;
		console.log(username2+" "+state2+" "+roomName2);
	});
	console.log(username2+" "+state2+" "+roomName2);
  return colorT;
}

function mouseDown(e){
  drawmode = true;
  clearRect = false;
  current.x =  event.pageX;
  current.y =  event.pageY;

/*
    var color1 = getcolor(e);
    console.log(color1);
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(event.pageX,event.pageY);
    ctx.strokeStyle = color[color1];
    ctx.lineWidth=2;
    drawmode = true;
*/
}
function mouseUp(e) {

  color1 = getcolor(e);
  console.log(color[color1]);
  //console.log("current  " + current.x + "   " + current.y + " event " + event.pageX + "  " + event.pageY);
  drawLine(current.x, current.y-800, event.pageX, event.pageY-800, color1, size, true);
  ctx.closePath();
  drawmode = false ;

}
function onMouseMove(e){
  var xCanvas = myCanvas.offsetLeft - myCanvas.scrollLeft + myCanvas.clientLeft;
  console.log("drawmode"+drawmode);
  if(event.pageX < 50 + xCanvas  )
    drawmode = false;
   if(event.pageX > 50+xCanvas && drawmode== true)
    {
    //console.log("current  " + current.x + "   " + current.y + " event " + event.pageX + "  " + event.pageY);
    drawLine(current.x, current.y-800, event.pageX, event.pageY-800, color1, size, true);
    current.x = event.pageX;
    current.y = event.pageY;
    }
  clearRect = false;
  }
 function senddata(data){
  //console.log(data.color);
  drawLine(data.x0 , data.y0 , data.x1 , data.y1 , data.color ,data.size);
 }
socket.on('drawing', senddata,roomName2);
function drawLine(x0, y0, x1, y1, colorP, size, emit){
	//if(state2=='Create'){
    ctx.beginPath();
    //console.log(x0 + "  " + y0 + "  " + x1 + "  " + y1 +"  "+color[colorP])
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    //console.log(color[colorP]);
    ctx.strokeStyle = color[colorP];
    ctx.lineWidth = size;
    ctx.stroke();
	//}
  if (!emit) { return; }
    socket.emit('drawing', {
      x0: x0 ,
      y0: y0 ,
      x1: x1 ,
      y1: y1 ,
      color: colorP,
      size:size,
    });
  }
/*
function mouseMove(e) {
  var xPosition = event.pageX;
    var yPosition = event.pageY;
  if(xPosition > 50 && drawmode== true)
  {
        ctx.lineTo(event.pageX, event.pageY);
        ctx.stroke();
  }
}
*/
// image

function drawImage(img, x, y, neww, newh) {//圖片顯示
   var dataUrl;  
   var width = c.width;  
   ctx.drawImage(img, x, y, neww, newh);   
   dataUrl = canvas.toDataURL();
   console.log(dataUrl);
   document.getElementById('imageData').href = dataUrl;
   ls.setItem('image', img.src);
}

 function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }
  function onResize() {
   // c.width = 600;
   // c.height = 500;
  }