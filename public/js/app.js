window.addEventListener('load', () => {
  // Chat platform
 
  const chatTemplate = Handlebars.compile($('#chat-template').html());
  const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());
  const chatEl = $('#chat');
  const formEl = $('.form');
  const messages = [];
  let username;

  // Local Video
  const localImageEl = $('#local-image');
  const localVideoEl = $('#local-video');
  // local canvas
  //const locaCanvasE1 = $('#myCanvas');
	var state3;
	var roomName3;
	var userName3;
  // Remote Videos
  const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
  const remoteVideosEl = $('#remote-videos');
  let remoteVideosCount = 0;

  // Hide cameras until they are initialized
  localVideoEl.hide();

  // Add validation rules to Create/Join Room Form
  formEl.form({
    fields: {
      roomName: 'empty',
      username: 'empty',
	  theme: 'empty'
    },
  });
	socket.on('back', function(state,roomName,username){
		state3=state;
		roomName3=roomName;
		username3=username;
	});
  // create our webrtc connection
  const webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'local-video',
    // canvas
    //locaCanvasE1: 'myCanvas',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remote-videos',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false,
  });

  // We got access to local camera
  webrtc.on('localStream', () => {
    localImageEl.hide();
    localVideoEl.show();
    //localCanvaE1.show();
  });

  // Remote video was added
  webrtc.on('videoAdded', (video, peer) => {
    // eslint-disable-next-line no-console
    const id = webrtc.getDomId(peer);
    const html = remoteVideoTemplate({ id });
    if (remoteVideosCount === 0) {
      remoteVideosEl.html(html);
    } else {
      remoteVideosEl.append(html);
    }
    $(`#${id}`).html(video);
    $(`#${id} video`).addClass('ui image medium'); // Make video element responsive
    remoteVideosCount += 1;
  });

  // Update Chat Messages
  const updateChatMessages = () => {
    const html = chatContentTemplate({ messages });
    const chatContentEl = $('#chat-content');
    chatContentEl.html(html);
    // automatically scroll downwards
    const scrollHeight = chatContentEl.prop('scrollHeight');
    chatContentEl.animate({ scrollTop: scrollHeight }, 'slow');
  };

  // Post Local Message
  const postMessage = (message) => {
    const chatMessage = {
      username,
      message,
      postedOn: new Date().toLocaleString('en-GB'),
    };
    // Send to all peers
    webrtc.sendToAll('chat', chatMessage);
    // Update messages locally
    messages.push(chatMessage);
    $('#post-message').val('');
    updateChatMessages();
  };

  // Display Chat Interface
  const showChatRoom = (room) => {
    formEl.hide();
    const html = chatTemplate({ room });
    chatEl.html(html);
    const postForm = $('form');
    postForm.form({
      message: 'empty',
    });
    $('#post-btn').on('click', () => {
      const message = $('#post-message').val();
      postMessage(message);
    });
    $('#post-message').on('keyup', (event) => {
      if (event.keyCode === 13) {
        const message = $('#post-message').val();
        postMessage(message);
      }
    });
	socket.on('Room2', function(state,roomName,username){//所有畫面一起清除
		state2=state;
		roomName2=roomName;
		username2=username;
		//console.log(username+" "+state+" "+roomName);
	});
  };

  // Register new Chat Room
  const createRoom = (roomName) => {
    // eslint-disable-next-line no-console
    //console.info(`Creating new room: ${roomName}`);
    webrtc.createRoom(roomName, (err, name) => {
      formEl.form('clear');
      showChatRoom(name);
      postMessage(`${username} created chatroom`);
	  socket.emit('roomstate','Create',roomName,username,theme);
	  //console.log(username+" "+'Create'+" "+roomName);
	  if(roomName3!=null){
		console.log(roomName3);
	  }
    });
  };

  // Join existing Chat Room
  const joinRoom = (roomName) => {
    // eslint-disable-next-line no-console
    //console.log(`Joining Room: ${roomName}`);
    webrtc.joinRoom(roomName);
    showChatRoom(roomName);
    postMessage(`${username} joined chatroom`);
	socket.emit('roomstate','Join',roomName,username,theme);
	//console.log(username+" "+'join'+" "+roomName);
  };

  // Receive message from remote user
  webrtc.connection.on('message', (data) => {
    if (data.type === 'chat') {
      const message = data.payload;
      messages.push(message);
      updateChatMessages();
    }
  });

  // Room Submit Button Handler
  $('.submit').on('click', (event) => {
    if (!formEl.form('is valid')) {
      return false;
    }
    username = $('#username').val();
	theme = $('#theme').val();
    const roomName = $('#roomName').val().toLowerCase();
    if (event.target.id === 'create-btn') {
      createRoom(roomName);
    } else {
      joinRoom(roomName);
    }
    return false;
  });
});