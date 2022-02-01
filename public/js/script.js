const constraint = { audio: false, video: true };
const Video = document.getElementById("video-grid");
const myVideo = document.createElement("video");
let myVideoStream;
myVideo.muted = true;
let userId;
const socket = io("/");
var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});
peer.on("open", (id) => {
    console.log("peer id =>", id);
    socket.emit("join-room", RoomId, id);
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    console.log("Going to stream ...");
    call.on("stream", (userVideoStream) => {
        console.log("Streaming the data");
        addVideoStream(video, userVideoStream);
    });
    call.on("error", (error) => {
        console.log("error =>", error);
    });
};
const leaveMeeting = () => {
    window.location.href = "/"
}
const getMediastream = async() => {
    const mediastream = await navigator.mediaDevices.getUserMedia(constraint);
    addVideoStream(myVideo, mediastream);
    socket.emit("media-received", RoomId);
    myVideoStream = mediastream;
    peer.on("call", (call) => {
        console.log("incoming call");
        call.answer(mediastream);
        const video = document.createElement("video");
        console.log("Sending to stream ...");
        call.on("stream", (userVideoStream) => {
            console.log("Streaming the data who called");
            addVideoStream(video, userVideoStream);
        });
    });
    peer.on("error", (err) => {
        console.log(err);
    });
    socket.on("user-connected", (id) => {
        console.log("userid =>", id);
        userId = id;
        console.log("My socket id ", socket.id);
        //setTimeout(connectToNewUser, 3000, userId, mediastream)
    });
    socket.on("peer-to-peer", () => {
        console.log("Connecting....");
        connectToNewUser(userId, mediastream);
    });

    return mediastream;
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    Video.append(video);
};

let message = document.getElementById("chat_message");
let chat = document.getElementById("messages_window");
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && message.value.length !== 0) {
        socket.emit("send-message", message.value, RoomId, peer.id, Clientname);
        message.value = "";
    }
});

socket.on("recive-message", (message, id, name) => {
    let data = document.createElement("li");
    if (id !== peer.id) {
        data.classList.add("message", "message-received");
        data.innerHTML = `<div class="message_chat"><div><span>${message}</span></div><div ><span class='name'>${name}</span></div></div>`;
        chat.append(data);
    } else {
        data.classList.add("message", "message-sent");
        console.log("my message =>", message);
        data.innerHTML = `<div class="message_chat"><div><span>${message}</span></div><div ><span class='name'>${Clientname}</span></div></div>`;
        chat.append(data);
    }
    data.scrollIntoView(true);
});

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const setMuteButton = () => {
    const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;
    document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`;
    document.querySelector(".main__mute_button").innerHTML = html;
};

const stopVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const setStopVideo = () => {
    const html = `<i class="fas fa-video"></i><span>Stop Video</span>`;
    document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
    const html = `<i class="stop fas fa-video-slash"></i><span>Play Video</span>`;
    document.querySelector(".main__video_button").innerHTML = html;
};

getMediastream();