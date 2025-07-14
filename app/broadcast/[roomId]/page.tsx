'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useWebRTC } from '@/hooks/useWebRTC';
import MediaControls from '@/components/MediaControls';
import ViewerCard from '@/components/ViewerCard';

export default function BroadcastPage({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const { roomId } = use(params);
  const {
    socket,
    connected,
    audioEnabled,
    videoEnabled,
    localVideoRef,
    localStream,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(roomId, 'broadcaster');

  const [viewerCount, setViewerCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState<Map<string, { id: string; joinTime: Date }>>(new Map());
  const [selectedViewer, setSelectedViewer] = useState<string | null>(null);

  const viewerVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const viewerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStream) {
      setIsStreaming(true);
    }
  }, [localStream]);

  // Broadcaster socket handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('viewer', async (viewerId: string) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionsRef.current.set(viewerId, pc);
      setViewers(prev => {
        const newViewers = new Map(prev);
        newViewers.set(viewerId, { id: viewerId, joinTime: new Date() });
        return newViewers;
      });
      setViewerCount(prev => prev + 1);

      localStream?.getTracks().forEach(track => {
        pc.addTrack(track, localStream!);
      });

      pc.ontrack = (event) => {
        const videoElement = document.createElement('video');
        videoElement.srcObject = event.streams[0];
        videoElement.autoplay = true;
        videoElement.muted = true;
        
        viewerVideosRef.current.set(viewerId, videoElement);
        
        // Force re-render to update viewer cards
        setViewers(prev => new Map(prev));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', viewerId, event.candidate);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', viewerId, offer);
    });

    socket.on('answer', async (viewerId: string, answer: RTCSessionDescriptionInit) => {
      const pc = peerConnectionsRef.current.get(viewerId);
      if (pc) {
        await pc.setRemoteDescription(answer);
      }
    });

    socket.on('candidate', async (viewerId: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConnectionsRef.current.get(viewerId);
      if (pc) {
        await pc.addIceCandidate(candidate);
      }
    });

    socket.on('viewer-disconnected', (viewerId: string) => {
      const pc = peerConnectionsRef.current.get(viewerId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(viewerId);
      }

      viewerVideosRef.current.delete(viewerId);

      setViewers(prev => {
        const newViewers = new Map(prev);
        newViewers.delete(viewerId);
        return newViewers;
      });

      setViewerCount(prev => Math.max(0, prev - 1));
      
      if (selectedViewer === viewerId) {
        setSelectedViewer(null);
      }
    });

    return () => {
      socket.off('viewer');
      socket.off('answer');
      socket.off('candidate');
      socket.off('viewer-disconnected');
    };
  }, [socket, localStream, selectedViewer]);

  const handleEndBroadcast = () => {
    if (confirm('Are you sure you want to end the broadcast?')) {
      router.push('/');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Broadcaster Dashboard</h1>
              <p className="text-gray-400 mt-1">Room: {roomId} • {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition duration-300"
              >
                Back to Home
              </Link>
              <button
                onClick={handleEndBroadcast}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300"
              >
                End Broadcast
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Stream</h2>
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

            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Room Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Room ID</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-2xl font-bold">{roomId}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(roomId);
                          alert('Room ID copied!');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <p className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-semibold ${isStreaming ? 'text-green-400' : 'text-red-400'}`}>
                        {isStreaming ? 'Live' : 'Offline'}
                      </span>
                    </p>
                    <p className="flex justify-between mt-1">
                      <span>Viewers:</span>
                      <span className="font-semibold">{viewerCount}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Share Link</h3>
                <p className="text-sm text-gray-400 mb-2">Viewers can join at:</p>
                <div className="bg-gray-700 p-2 rounded text-xs break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/join/{roomId}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Audio:</span>
                    <span className={audioEnabled ? 'text-green-400' : 'text-red-400'}>
                      {audioEnabled ? 'On' : 'Muted'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video:</span>
                    <span className={videoEnabled ? 'text-green-400' : 'text-red-400'}>
                      {videoEnabled ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Connected Viewers</h2>
              {viewerCount > 0 && (
                <p className="text-sm text-gray-400">Click on a viewer to focus</p>
              )}
            </div>
            
            {viewerCount === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">No viewers connected yet.</p>
                <p className="text-sm text-gray-500 mt-2">Share Room ID: <span className="font-bold text-white">{roomId}</span></p>
              </div>
            ) : (
              <div
                ref={viewerContainerRef}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {Array.from(viewers.entries()).map(([viewerId, viewer]) => (
                  <ViewerCard
                    key={viewerId}
                    viewerId={viewerId}
                    videoElement={viewerVideosRef.current.get(viewerId)}
                    onClick={() => setSelectedViewer(viewerId)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedViewer && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedViewer(null)}
            >
              <div 
                className="bg-gray-800 rounded-lg p-4 max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Viewer {selectedViewer.substring(0, 6)}</h3>
                  <button
                    onClick={() => setSelectedViewer(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <video
                  autoPlay
                  className="w-full rounded-lg bg-black"
                  ref={(el) => {
                    if (el && selectedViewer) {
                      const originalVideo = viewerVideosRef.current.get(selectedViewer);
                      if (originalVideo && originalVideo.srcObject) {
                        el.srcObject = originalVideo.srcObject;
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .viewer-video {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background-color: #000;
          border-radius: 8px 8px 0 0;
        }
        
        .viewer-card {
          position: relative;
          overflow: hidden;
        }
        
        .viewer-card:hover {
          transform: scale(1.05);
          transition: transform 0.2s;
        }
      `}</style>
    </>
  );
}