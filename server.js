const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const express = require("express");
const app = express();

let broadcaster;
const port = 4000;

const http = require("http");
const server = http.createServer(app);
var rooms = [];
const io = require("socket.io")(server);
const roomaloom = io.of("/").adapter.rooms;
app.use(express.static(__dirname + "/public"));
var roomId;

app.get('/broadcast',function(req,res){
  res.sendFile(__dirname+'/public/broadcast.html');
  
});

app.get('/broadcast/:roomId',function(req,res){
  roomId = req.params.roomId;
  rooms.push(roomId)
  res.sendFile(__dirname+'/public/broadcast.html');
  //socket.emit('join', roomId);
});

app.get('/watch',function(req,res){
  res.sendFile(__dirname+'/public/index.html');
});
  
app.get('/watch/:name',function(req,res){
  var name = req.params.name;
  console.log(name)
  console.log(roomaloom)
  if(rooms.includes(name)){
    res.sendFile(__dirname+'/public/index.html');
    roomId = name
  }
  else{
    console.log("No room with that id")
    res.sendFile(__dirname+'/public/404.html');
  }
});
    
function IDmatch(ID){
  return ID == roomId
}    

function removeID(){
  rooms = rooms.filter(IDmatch)
}

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("join-room",)
  console.log("joining room :" + roomId)
  socket.join(roomId);  
  
  //console.log(io.sockets.rooms);
  // socket.on('join', (roomid)=>{
  //   const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 }
  //   const numberOfClients = roomClients.length

  //   // These events are emitted only to the sender socket.
  //   if (numberOfClients == 0) {
  //     console.log(`Creating room ${roomId} and emitting room_created socket event`)
  //     socket.join(roomId)
  //     socket.emit('room_created', roomId)
  //   } else if (numberOfClients == 1) {
  //     console.log(`Joining room ${roomId} and emitting room_joined socket event`)
  //     socket.join(roomId)
  //     socket.emit('room_joined', roomId)
  //   } else {
  //     console.log(`Can't join room ${roomId}, emitting full_room socket event`)
  //     socket.emit('full_room', roomId)
  //   }
  // });
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.to(roomId).emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(roomId).to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(roomId).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(roomId).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(roomId).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(roomId).emit("disconnectPeer", socket.id);
   // socket.leave(roomId)
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
