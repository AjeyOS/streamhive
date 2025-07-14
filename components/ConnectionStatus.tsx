interface ConnectionStatusProps {
  connected: boolean;
  broadcasterOnline: boolean;
  permissionGranted: boolean;
  roomError: string;
}

export default function ConnectionStatus({
  connected,
  broadcasterOnline,
  permissionGranted,
  roomError,
}: ConnectionStatusProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs text-gray-400">Server</p>
            <p className="text-sm font-semibold">{connected ? 'Connected' : 'Disconnected'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${broadcasterOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs text-gray-400">Broadcaster</p>
            <p className="text-sm font-semibold">{broadcasterOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${permissionGranted ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs text-gray-400">Permissions</p>
            <p className="text-sm font-semibold">{permissionGranted ? 'Granted' : 'Denied'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Room Status</p>
            <p className="text-sm font-semibold">{roomError || 'Active'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}