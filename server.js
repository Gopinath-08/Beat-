const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Check file extension
        const allowedExtensions = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;
        const hasValidExtension = allowedExtensions.test(file.originalname);

        // Check MIME type (more permissive)
        const allowedMimeTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/ogg',
            'audio/oga',
            'audio/m4a',
            'audio/aac',
            'audio/flac',
            'audio/x-flac',
            'audio/webm',
            'audio/mp4',
            'audio/x-m4a'
        ];

        const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);

        // Accept if either extension or MIME type is valid
        if (hasValidExtension || hasValidMimeType) {
            return cb(null, true);
        } else {
            console.log('Rejected file:', file.originalname, 'MIME:', file.mimetype);
            cb(new Error('Only audio files are allowed!'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ error: error.message });
    }

    if (error.message === 'Only audio files are allowed!') {
        return res.status(400).json({ error: 'Invalid file type. Please upload an audio file (MP3, WAV, OGG, M4A, AAC, FLAC).' });
    }

    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
});

// Sample tracks with love theme
const sampleTracks = [
    {
        id: 1,
        title: "Perfect",
        artist: "Ed Sheeran",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 263,
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        isUploaded: false
    },
    {
        id: 2,
        title: "All of Me",
        artist: "John Legend",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 271,
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
        isUploaded: false
    },
    {
        id: 3,
        title: "Just the Way You Are",
        artist: "Bruno Mars",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: 221,
        cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
        isUploaded: false
    },
    {
        id: 4,
        title: "A Thousand Years",
        artist: "Christina Perri",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: 269,
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
        isUploaded: false
    },
    {
        id: 5,
        title: "Can't Help Falling in Love",
        artist: "Elvis Presley",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration: 181,
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        isUploaded: false
    }
];

// Uploaded tracks storage
let uploadedTracks = [];
let nextTrackId = 1000;

// Room management
const rooms = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (data) => {
        const { username, room } = data;
        
        // Join the room
        socket.join(room);
        socket.username = username;
        socket.room = room;

        // Initialize room if it doesn't exist
        if (!rooms.has(room)) {
            rooms.set(room, {
                users: new Set(),
                currentTrack: null,
                isPlaying: false,
                currentTime: 0,
                messages: []
            });
        }

        const roomData = rooms.get(room);
        roomData.users.add(username);

        // Get all tracks (sample + uploaded)
        const allTracks = [...sampleTracks, ...uploadedTracks];

        // Emit room joined event
        socket.emit('roomJoined', {
            userCount: roomData.users.size,
            tracks: allTracks,
            currentTrack: roomData.currentTrack,
            isPlaying: roomData.isPlaying,
            currentTime: roomData.currentTime
        });

        // Notify other users in the room
        socket.to(room).emit('userJoined', {
            username: username,
            userCount: roomData.users.size
        });

        console.log(`${username} joined room: ${room}`);
    });

    socket.on('message', (data) => {
        const { room, message, username } = data;
        
        // Store message in room
        if (rooms.has(room)) {
            const roomData = rooms.get(room);
            roomData.messages.push({
                username: username,
                message: message,
                timestamp: new Date().toISOString()
            });

            // Keep only last 100 messages
            if (roomData.messages.length > 100) {
                roomData.messages = roomData.messages.slice(-100);
            }
        }

        // Broadcast message to room
        io.to(room).emit('message', {
            username: username,
            message: message
        });
    });

    socket.on('playMusic', (data) => {
        const { room, track, isPlaying, currentTime = 0 } = data;
        
        if (rooms.has(room)) {
            const roomData = rooms.get(room);
            roomData.currentTrack = track;
            roomData.isPlaying = isPlaying;
            roomData.currentTime = currentTime;

            // Broadcast to all users in the room
            io.to(room).emit('playMusic', {
                track: track,
                isPlaying: isPlaying,
                currentTime: currentTime
            });
        }
    });

    socket.on('disconnect', () => {
        if (socket.room && socket.username) {
            const roomData = rooms.get(socket.room);
            if (roomData) {
                roomData.users.delete(socket.username);
                
                // Remove room if empty
                if (roomData.users.size === 0) {
                    rooms.delete(socket.room);
                } else {
                    // Notify remaining users
                    socket.to(socket.room).emit('userLeft', {
                        username: socket.username,
                        userCount: roomData.users.size
                    });
                }
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

// File upload endpoint
app.post('/upload-song', upload.single('song'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title } = req.body;
        const filename = req.file.filename;
        const filePath = `/uploads/${filename}`;

        const newTrack = {
            id: nextTrackId++,
            title: title || req.file.originalname.replace(/\.[^/.]+$/, ""),
            artist: 'Unknown Artist',
            url: filePath,
            duration: 0,
            cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            isUploaded: true,
            uploadedBy: req.body.username || 'Anonymous',
            uploadedAt: new Date().toISOString()
        };

        console.log('New track created:', newTrack);
        console.log('File path:', filePath);

        uploadedTracks.push(newTrack);
        io.emit('newTrackUploaded', newTrack);
        res.json({ success: true, track: newTrack, message: 'Song uploaded successfully!' });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// API Routes
app.get('/api/tracks', (req, res) => {
    const allTracks = [...sampleTracks, ...uploadedTracks];
    res.json(allTracks);
});

app.get('/api/uploaded-tracks', (req, res) => {
    res.json(uploadedTracks);
});

// Delete uploaded track
app.delete('/api/tracks/:trackId', (req, res) => {
    const trackId = parseInt(req.params.trackId);
    const trackIndex = uploadedTracks.findIndex(track => track.id === trackId);

    if (trackIndex === -1) {
        return res.status(404).json({ error: 'Track not found' });
    }

    const track = uploadedTracks[trackIndex];

    // Delete file from filesystem
    const filePath = path.join(__dirname, 'uploads', path.basename(track.url));
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Remove from uploaded tracks array
    uploadedTracks.splice(trackIndex, 1);

    // Notify all clients about track deletion
    io.emit('trackDeleted', { trackId });

    res.json({ success: true, message: 'Track deleted successfully' });
});

// Test endpoint to check if uploaded files are accessible
app.get('/test-upload/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        rooms: rooms.size,
        uploadedTracks: uploadedTracks.length
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`💕 Love Music Room server running on port ${PORT}`);
    console.log(`🎵 Sample tracks loaded: ${sampleTracks.length}`);
    console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
}); 