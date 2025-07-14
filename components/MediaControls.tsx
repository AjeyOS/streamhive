interface MediaControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export default function MediaControls({ 
  audioEnabled, 
  videoEnabled, 
  onToggleAudio, 
  onToggleVideo 
}: MediaControlsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onToggleAudio}
        className={`p-2 rounded-lg transition ${
          audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
        }`}
        title={audioEnabled ? 'Mute audio' : 'Unmute audio'}
      >
        {audioEnabled ? '🎤' : '🔇'}
      </button>
      <button
        onClick={onToggleVideo}
        className={`p-2 rounded-lg transition ${
          videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
        }`}
        title={videoEnabled ? 'Turn off video' : 'Turn on video'}
      >
        {videoEnabled ? '📹' : '📵'}
      </button>
    </div>
  );
}