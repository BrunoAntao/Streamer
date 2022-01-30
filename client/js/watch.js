let peerConnection;
const config = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"]
        }
    ]
};

const socket = io.connect();
const video = document.querySelector("video");

let n = window.location.pathname.split('/');
let name = n[n.length - 1];

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

    peerConnection.oniceconnectionstatechange = function () {

        if (peerConnection.iceConnectionState == 'disconnected') {

            video.style.display = 'none';

        }

    }

    video.style.display = 'block';

});

socket.on("candidate", (id, candidate) => {
    peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
});

socket.on("connect", () => {
    socket.emit("watcher", name);
});

socket.on("broadcaster", () => {
    socket.emit("watcher", name);
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};