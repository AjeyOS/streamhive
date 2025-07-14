const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store rooms with their broadcasters
  const rooms = new Map(); // roomId -> { broadcasterId, viewers: Set }

  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('broadcaster', (roomId) => {
      if (rooms.has(roomId)) {
        socket.emit('room-exists');
        return;
      }

      rooms.set(roomId, {
        broadcasterId: socket.id,
        viewers: new Set()
      });

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'broadcaster';
      
      socket.to(roomId).emit('broadcaster');
      console.log('Broadcaster set for room:', roomId);
    });

    socket.on('viewer', (roomId) => {
      if (!rooms.has(roomId)) {
        socket.emit('room-not-found');
        return;
      }

      const room = rooms.get(roomId);
      room.viewers.add(socket.id);
      
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'viewer';
      
      socket.emit('broadcaster'); // Notify viewer that broadcaster exists
      socket.to(room.broadcasterId).emit('viewer', socket.id);
      
      console.log('New viewer in room:', roomId);
    });

    socket.on('offer', (id, offer) => {
      socket.to(id).emit('offer', socket.id, offer);
    });

    socket.on('answer', (id, answer) => {
      socket.to(id).emit('answer', socket.id, answer);
    });

    socket.on('candidate', (id, candidate) => {
      socket.to(id).emit('candidate', socket.id, candidate);
    });

    socket.on('leave-room', (roomId) => {
      handleDisconnect(socket);
    });

    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });

    function handleDisconnect(socket) {
      const { roomId, role } = socket.data;
      
      if (!roomId) return;

      if (role === 'broadcaster') {
        socket.to(roomId).emit('broadcaster-disconnected');
        rooms.delete(roomId);
        console.log('Broadcaster disconnected, room closed:', roomId);
      } else if (role === 'viewer') {
        const room = rooms.get(roomId);
        if (room) {
          room.viewers.delete(socket.id);
          socket.to(room.broadcasterId).emit('viewer-disconnected', socket.id);
          console.log('Viewer disconnected from room:', roomId);
        }
      }
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});