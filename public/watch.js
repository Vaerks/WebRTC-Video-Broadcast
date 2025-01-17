let peerConnection;
const config = {
  iceServers: [
    { 
    //  "urls": "stun:stun.l.google.com:19302",
      "urls":"stun:stun.mhtech.dk:3478"
    },
     { 
       "urls": "turn:turn.mhtech.dk:3478?transport=tcp",
       "username": "vaerks",
       "credential": "Vaerks1992!"
     }
]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});


socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  //peerConnection.close();
  socket.close();
  //peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}