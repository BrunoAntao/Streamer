const peerConnections = {};
const config = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"]
        }
    ]
};

const socket = io.connect();
const video = document.querySelector("video");

video.style.display = 'none';

let name = document.createElement('input');
let start = document.createElement('button');

start.innerHTML = 'Start';
start.addEventListener('click', (e) => {

    if (name.value.trim() != '') {

        name.style.display = 'none';
        start.style.display = 'none';
        video.style.display = 'block';
        stream(name.value);

    }

})

document.body.append(name);
document.body.append(start);

let stream = (name) => {

    const constraints = {
        video: {
            frameRate: 60,
            cursor: "always"
        },
        audio: {
            echoCancellation: false,
            googleAutoGainContol: false
        }
    };

    navigator.mediaDevices
        .getDisplayMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            socket.emit("broadcaster", name);
        })
        .catch(error => console.error(error));

}

socket.on("watcher", id => {

    console.log(id);

    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;

    let stream = video.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };

    peerConnection
        .createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("offer", id, peerConnection.localDescription);
        });

});

socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
});

socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
    peerConnections[id].close();
    delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {

    Object.keys(peerConnections).forEach(id => {

        peerConnections[id].close();
        delete peerConnections[id];

    })
    socket.close();
};