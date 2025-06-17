import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080");

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
    window.location.href = "/"; // Redirect to home or another page
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Room: {roomId}</h2>
          <div className="inline-flex items-center px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              status === "Connected" ? "bg-green-400 animate-pulse" : 
              status.includes("Error") || status.includes("failed") ? "bg-red-400" : 
              "bg-yellow-400 animate-pulse"
            }`}></div>
            <span className="text-white/90 font-medium">{status}</span>
          </div>
        </div>

        {/* Video Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Local Video */}
          <div className="relative group">
            <div className="aspect-video bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white text-sm font-medium">You</span>
              </div>
              {isVideoOff && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </div>
                    <p className="text-white/80">Video is off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative group">
            <div className="aspect-video bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white text-sm font-medium">Remote</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-4">
              {/* Mute Button */}
              <button
                onClick={toggleAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                  isAudioMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                }`}
                title={isAudioMuted ? 'Unmute' : 'Mute'}
              >
                {isAudioMuted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              {/* Video Button */}
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                  isVideoOff
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                }`}
                title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
              >
                {isVideoOff ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* Leave Call Button */}
              <button
                onClick={leaveCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/25"
                title="Leave Call"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18M9.172 9.172a4 4 0 015.656 0M9.172 9.172L5.05 5.05a10 10 0 0114.9 0l-4.122 4.122m-5.656 5.656a4 4 0 010-5.656m0 5.656L9.172 14.828a10 10 0 01-4.122 4.122" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;