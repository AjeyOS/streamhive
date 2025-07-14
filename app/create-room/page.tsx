'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateRoomId } from '@/lib/utils';

export default function CreateRoom() {
  const router = useRouter();
  const [inputRoomId, setInputRoomId] = useState('');
  const [roomError, setRoomError] = useState('');

  const handleCreateRoom = () => {
    const roomId = inputRoomId || generateRoomId();
    router.push(`/broadcast/${roomId}`);
  };

  const handleQuickStart = () => {
    const roomId = generateRoomId();
    router.push(`/broadcast/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Create Broadcast Room</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID (e.g., ABC123)"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to generate a random ID
              </p>
            </div>

            {roomError && (
              <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3">
                <p className="text-sm text-red-400">{roomError}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCreateRoom}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition duration-300"
              >
                Create Room
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition duration-300 text-center"
              >
                Cancel
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Start</h3>
              <button
                onClick={handleQuickStart}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Generate random room ID →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}