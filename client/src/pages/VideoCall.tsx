import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const socket: Socket = io(import.meta.env.VITE_SOCKET_URL, {
  path: "/socket.io/",
  transports: ["websocket"],
  withCredentials: true,
});

const VideoCall = ({ roomId }: { roomId: string }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const startCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnection.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setStatus("Connected");
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { roomId, candidate: event.candidate });
        }
      };

      peer.onconnectionstatechange = () => {
        setStatus(
          peer.connectionState === "connected"
            ? "Connected"
            : peer.connectionState === "failed"
            ? "Connection failed"
            : peer.connectionState
        );
      };

      peer.oniceconnectionstatechange = () => {
        if (peer.iceConnectionState === "failed") {
          peer.restartIce();
        }
      };

      socket.emit("join-video-room", roomId);

      socket.on("room-full", ({ message }) => {
        setStatus(message);
        toast.error(message);
      });

      socket.on("offer", async ({ offer }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      });

      socket.on("answer", async ({ answer }) => {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (candidate) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error("Error adding received ICE candidate", error);
          }
        }
      });

      socket.on("user-joined", async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      });

      socket.on("user-left", () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        setStatus("User left");
      });
    };

    startCall();

    return () => {
      socket.emit("leave-video-room", roomId);
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("room-full");

      peerConnection.current?.close();
      peerConnection.current = null;

      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsVideoOff(!isVideoOff);
  };

  const leaveCall = () => {
    socket.emit("leave-video-room", roomId);
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <h2 className="text-3xl text-white text-center mb-6">Room: {roomId}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-video bg-black relative">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <span className="absolute top-2 left-2 text-white bg-black px-2 py-1 rounded">You</span>
        </div>
        <div className="aspect-video bg-black relative">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <span className="absolute top-2 left-2 text-white bg-black px-2 py-1 rounded">Remote</span>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={toggleAudio} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isAudioMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleVideo} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </button>
        <button onClick={leaveCall} className="px-4 py-2 bg-red-600 text-white rounded">
          Leave Call
        </button>
      </div>

      <p className="text-center text-white mt-4">Status: {status}</p>
    </div>
  );
};

export default VideoCall;
