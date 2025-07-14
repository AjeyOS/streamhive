'use client';

import { useEffect, useRef } from 'react';

interface ViewerCardProps {
  viewerId: string;
  videoElement?: HTMLVideoElement;
  onClick: () => void;
}

export default function ViewerCard({ viewerId, videoElement, onClick }: ViewerCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoElement && containerRef.current) {
      // Clone the video element to avoid DOM manipulation issues
      const clonedVideo = videoElement.cloneNode(true) as HTMLVideoElement;
      clonedVideo.className = 'viewer-video';
      clonedVideo.onclick = onClick;
      
      // Clear existing content and append the video
      const container = containerRef.current;
      container.innerHTML = '';
      container.appendChild(clonedVideo);
    }
  }, [videoElement, onClick]);

  return (
    <div 
      className="viewer-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
      onClick={onClick}
    >
      <div ref={containerRef} />
      <div className="p-2 text-sm text-center bg-gray-700">
        Viewer {viewerId.substring(0, 6)}
      </div>
    </div>
  );
}