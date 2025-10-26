import { markVideoCall } from "@/api/booking";
import { RootState } from "@/redux/store";
import { NotebookPen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
  const [notePadOpen, setNotePadOpen] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const { user } = useSelector((state: RootState) => state.auth);

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

      peer.onconnectionstatechange = async () => {
        if (peer.connectionState === "connected") {
          try {
            await markVideoCall(roomId!); 
            setStatus("Connected");
          } catch (err) {
            console.error("Error marking video call:", err);
            setStatus("Error updating call status");
          }
        } else if (peer.connectionState === "failed") {
          setStatus("Connection failed");
        } else {
          setStatus(peer.connectionState);
        }
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
    stream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    stream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
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

  const notpadModalOpen = () => {
    setNotePadOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 p-4">
        <h2 className="text-3xl text-white text-center mb-6">Room: {roomId}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-video bg-black relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 text-white bg-black px-2 py-1 rounded">
              You
            </span>
          </div>
          <div className="aspect-video bg-black relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 text-white bg-black px-2 py-1 rounded">
              Remote
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          {user?.role === "advocate" && (
            <div className="absolute right-6 flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-black transition-all duration-300">
              <NotebookPen className="w-5 h-5 text-yellow-400" />
              <button
                className="font-medium text-sm hover:text-yellow-400 transition-colors duration-300"
                onClick={notpadModalOpen}
              >
                Take Note
              </button>
            </div>
          )}

          <button
            onClick={toggleAudio}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isAudioMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={toggleVideo}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isVideoOff ? "Turn Video On" : "Turn Video Off"}
          </button>
          <button
            onClick={leaveCall}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Leave Call
          </button>
        </div>

        <p className="text-center text-white mt-4">Status: {status}</p>
      </div>

      {notePadOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-500 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative">
            <button
              onClick={() => setNotePadOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold text-black mb-2">
              Coming Soon 🚀
            </h2>
            <p className="text-gray-900 text-sm">
              We’re working hard to bring this feature to you soon.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCall;
