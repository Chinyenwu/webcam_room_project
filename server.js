var express = require('express');

var app = express();
// add socket
var http = require('http').Server(app);
var io = require('socket.io')(http);
//
var port = process.env.PORT ||3232;
var ip = '140.136.150.93';
// Set public folder as root
app.use(express.static('public'));

// Provide access to node_modules folder from the client-side
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

// add socket

var roomidlist =[];
var themelist =[];
var statelist =[];
var userlist =[];
var max=1;

//var roomno = 1;
var i;

io.on('connection', function (socket){
	var curRoomName  = "大廳";
	var room2;

    socket.on('certain', function(roomName){
		curRoomName = roomName;
    });
	socket.join(curRoomName);
	socket.on('roomlist', function(key){
		io.emit('Roomlist', roomidlist);//收到訊息後把清除的資料廣播到client端
		io.emit('Roomlist3', roomidlist,themelist);
    });
	socket.on('roomstate', function(state,roomName,username,theme){
        //socket.emit('Room', state,roomName,username);//收到訊息後把清除的資料廣播到client端
		statelist.push(state);
		socket.leave("大廳");
		for(i=0;i<=max;i++){
			if(roomidlist[i]==roomName){
				socket.emit('backjoin', state,roomName,username);
				break;
				}
			else if(i==max-1){
				roomidlist.push(roomName);
				userlist.push(username);
				themelist.push(theme);
				max=max+1;
				io.emit('Roomlist2', roomidlist);
				break;
			}
		}
		socket.join(roomName);
		socket.emit('back', state,roomName,username);
		io.in(roomName).emit('Room2', state,roomName,username);
		curRoomName = roomName;
		io.emit('Roomlist3', roomidlist,themelist);
		console.log(io.sockets.adapter.rooms[curRoomName]);
    });
	socket.on('drawing',function(data,list) {
		io.in(curRoomName).emit('drawing', data);
		io.in(curRoomName).emit('Room3', data);
		console.log(io.sockets.adapter.rooms[curRoomName]);
		io.emit('Roomlist3', roomidlist,themelist);
	});
	socket.on('pressed', function(key){
		io.in(curRoomName).emit('PlayersMoving', key);//收到訊息後把清除的資料廣播到client端
		io.emit('Roomlist3', roomidlist,themelist);
    });

	io.emit('Roomlist3', roomidlist,themelist);

	console.log("curent is "+curRoomName);
});


http.listen(port,ip,function ()  {
  console.info('listen on %s:%d',ip,port);
});

function isRoomExist (roomName, roomList) {
  return roomList[roomName] >= 0;
}
