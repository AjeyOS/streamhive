import { SOCKET_URL } from '@/lib/utils';
import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

export interface WebRTCState {
  socket: Socket | null;
  connected: boolean;
  permissionGranted: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

export function useWebRTC(roomId: string, role: 'broadcaster' | 'viewer') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setConnected(true);
      if (role === 'broadcaster') {
        socketInstance.emit('broadcaster', roomId);
      } else {
        socketInstance.emit('viewer', roomId);
      }
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setPermissionGranted(true);
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
        setPermissionGranted(false);
      });

    return () => {
      socketInstance.emit('leave-room', roomId);
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      socketInstance.disconnect();
    };
  }, [roomId, role]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  return {
    socket,
    connected,
    permissionGranted,
    audioEnabled,
    videoEnabled,
    localVideoRef,
    localStream: localStreamRef.current,
    toggleAudio,
    toggleVideo,
  };
}