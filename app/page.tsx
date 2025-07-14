'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <h1 className="text-5xl font-bold mb-8">One-to-Many Video Broadcasting</h1>
        
        <p className="text-xl text-gray-300 mb-12">
          Perfect for online examinations monitoring, multi-doctor consultations, 
          and real-time operations monitoring.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link
            href="/create-room"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition duration-300 block"
          >
            Start Broadcasting
          </Link>
          
          <Link
            href="/join"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition duration-300 block"
          >
            Join as Viewer
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📚 Exam Monitoring</h3>
            <p className="text-gray-300">
              Monitor multiple students during online examinations with real-time video feeds.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🏥 Medical Consultations</h3>
            <p className="text-gray-300">
              Multiple doctors can examine a single patient simultaneously through video.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">✈️ Operations Monitoring</h3>
            <p className="text-gray-300">
              Single operator can monitor multiple real-time feeds for efficient operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}