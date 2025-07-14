'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import MediaControls from '@/components/MediaControls';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useWebRTC } from '@/hooks/useWebRTC';


export default function ViewerPage({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const { roomId } = use(params);
  const {
    socket,
    connected,
    permissionGranted,
    audioEnabled,
    videoEnabled,
    localVideoRef,
    localStream,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(roomId, 'viewer');

  const [broadcasterOnline, setBroadcasterOnline] = useState(false);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [roomError, setRoomError] = useState('');

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Viewer socket handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('broadcaster', () => {
      setBroadcasterOnline(true);
      setRoomError('');
    });

    socket.on('room-not-found', () => {
      setRoomError('Room not found. Please check the room ID.');
      setBroadcasterOnline(false);
    });

    socket.on('offer', async (broadcasterId: string, offer: RTCSessionDescriptionInit) => {
      setConnectionState('Connecting to broadcaster...');
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionRef.current = pc;

      localStream?.getTracks().forEach(track => {
        pc.addTrack(track, localStream!);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', broadcasterId, event.candidate);
        }
      };

      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connected':
            setConnectionState('Connected to broadcaster');
            break;
          case 'connecting':
            setConnectionState('Connecting...');
            break;
          case 'disconnected':
          case 'failed':
            setConnectionState('Connection lost');
            break;
        }
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', broadcasterId, answer);
    });

    socket.on('candidate', async (broadcasterId: string, candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    socket.on('broadcaster-disconnected', () => {
      setBroadcasterOnline(false);
      setConnectionState('Broadcaster disconnected');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    });

    return () => {
      socket.off('broadcaster');
      socket.off('room-not-found');
      socket.off('offer');
      socket.off('candidate');
      socket.off('broadcaster-disconnected');
    };
  }, [socket, localStream]);

  const handleLeaveSession = () => {
    if (confirm('Are you sure you want to leave the session?')) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Viewer Interface</h1>
            <p className="text-gray-400 mt-1">Room: {roomId} • {connectionState}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition duration-300"
            >
              Back to Home
            </Link>
            <button
              onClick={handleLeaveSession}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
            >
              Leave Session
            </button>
          </div>
        </div>

        <ConnectionStatus
          connected={connected}
          broadcasterOnline={broadcasterOnline}
          permissionGranted={permissionGranted}
          roomError={roomError}
        />

        {roomError && (
          <div className="mb-8 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-4">
            <p className="text-red-400">{roomError}</p>
            <Link
              href="/join"
              className="mt-2 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition inline-block"
            >
              Try Different Room
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Broadcaster Stream</h2>
              {broadcasterOnline && (
                <span className="text-xs bg-red-600 px-2 py-1 rounded animate-pulse">LIVE</span>
              )}
            </div>
            <div className="relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-full rounded-lg bg-black"
                style={{ minHeight: '400px' }}
              />
              {!broadcasterOnline && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Waiting for broadcaster...</p>
                    <p className="text-sm text-gray-500">Room: {roomId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Camera</h2>
              <MediaControls
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
              />
            </div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full rounded-lg bg-black"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• You can see and hear the broadcaster</li>
                <li>• The broadcaster can see and hear you</li>
                <li>• You cannot see or hear other viewers</li>
                <li>• Make sure to allow camera and microphone access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Room Details</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Room ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{roomId}</span></p>
                <p>Connection: {connectionState}</p>
                <p>Your ID: {socket?.id?.substring(0, 8) || 'Not connected'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}