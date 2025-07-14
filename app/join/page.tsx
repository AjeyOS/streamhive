'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinRoom() {
  const router = useRouter();
  const [inputRoomId, setInputRoomId] = useState('');
  const [roomError, setRoomError] = useState('');

  const handleJoinRoom = () => {
    if (!inputRoomId) {
      setRoomError('Please enter a room ID');
      return;
    }
    router.push(`/viewer/${inputRoomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Join Broadcast Room</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID (e.g., ABC123)"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                Get this from the broadcaster
              </p>
            </div>

            {roomError && (
              <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3">
                <p className="text-sm text-red-400">{roomError}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleJoinRoom}
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition duration-300"
              >
                Join Room
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition duration-300 text-center"
              >
                Cancel
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Ask the broadcaster for the room ID</li>
                <li>• Ensure your camera and mic are ready</li>
                <li>• You'll see only the broadcaster</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}