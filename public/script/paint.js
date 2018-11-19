// add socket.io
var socket = io.connect('https://140.136.25.209:3232', {secure: true});
//參數
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var current = {};
var color1;
var size = 4;
var clearRect = false;
var state2;
var roomName2;
var username2;
var state3;
var roomName3;
var username3;
var list2=[] ;
var i;
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

const color = ["#ff4d4d","  #4169E1","  #FFA500","#333333"];
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
 ctx.fillStyle = "white";
 ctx.fillText("clear", 20 , 215);
 ctx.fillText("reload", 20 , 265);
window.addEventListener('load',function(){
    var canvas=document.querySelector('#myCanvas');
    canvas.addEventListener("click", getcolor, false);
    canvas.addEventListener('mousedown',mouseDown);
	//canvas.addEventListener('mousemove',mouseMove);
    canvas.addEventListener('mouseup',mouseUp);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
});
    socket.emit('pressed', 38);
	socket.on('PlayersMoving', function(key){
		ctx.clearRect(55, 0, 950 ,500 );
	});
	socket.on('back', function(state,roomName,username){
		state3=state;
		roomName3=roomName;
		username3=username;
	});

function LeaveButton() {
console.log('disconnect button pressed');
//window.location.reload();
socket.emit('DC',roomName3);
window.location.reload();
}

window.addEventListener('resize', onResize, false);
onResize();

function getcolor(e) {
//選顏色
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
	socket.on('PlayersMoving', function(key){
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
    socket.on('Room2', function(state,roomName,username){
		state2=state;
		roomName2=roomName;
		username2=username;
		console.log(username2+" "+state2+" "+roomName2);
	});
    socket.on('Room3', function(Data){

	});
	socket.emit('certain', roomName2);
	socket.emit('roomlist', 38);
	socket.on('Roomlist', function(roomidlist){
		list2 = roomidlist;
	});
	socket.on('Roomlist2', function(roomidlist){
		console.log(roomidlist);
	});
	console.log(username2+" "+state2+" "+roomName2);
	console.log(username3+" "+state3+" "+roomName3);
	console.log(list2);
  return colorT;

}
//畫畫
function mouseDown(e){
  drawmode = true;
  clearRect = false;
  current.x =  event.pageX;
  current.y =  event.pageY;
}
function mouseUp(e) {

  color1 = getcolor(e);
  console.log(color[color1]);
  drawLine(current.x-150, current.y-800, event.pageX-150, event.pageY-800, color1, size, true);
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
    drawLine(current.x-150, current.y-800, event.pageX-150, event.pageY-800, color1, size, true);
    current.x = event.pageX;
    current.y = event.pageY;
    }
  clearRect = false;

  }
 function senddata(data){
  drawLine(data.x0 , data.y0 , data.x1 , data.y1 , data.color ,data.size);
 }
socket.on('drawing', senddata);

console.log(list2);
function drawLine(x0, y0, x1, y1, colorP, size, emit){

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color[colorP];
    ctx.lineWidth = size;
    ctx.stroke();

		if (!emit) { return; }

		socket.emit('drawing', {
		x0: x0 ,
		y0: y0 ,
		x1: x1 ,
		y1: y1 ,
		color: colorP,
		size:size,
		},roomName2);

	console.log(roomName2);
  }


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
