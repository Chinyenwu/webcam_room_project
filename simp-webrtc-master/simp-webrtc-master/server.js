const express = require('express');

const app = express();
// add socket
const http = require('http').Server(app);
const io = require('socket.io')(http);
//
const port = 3000;

// Set public folder as root
app.use(express.static('public'));

// Provide access to node_modules folder from the client-side
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

//
// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

// add socket

var roomno = 0;
function onConnection(socket){
    roomno=roomno+1;
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('pressed', function(key){
        socket.broadcast.emit('PlayersMoving', key);//收到訊息後把清除的資料廣播到client端
    });
	console.log(roomno);
}

io.on('connection', onConnection);



app.listen(port, () => {
  console.info('listen on %d', port);
});