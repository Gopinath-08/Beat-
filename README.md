# 💕 Love Music Room

A beautiful, real-time music sharing and chat application with a romantic love theme. Share music and chat with your loved ones in synchronized listening rooms.

## ✨ Features

- **Real-time Music Synchronization** - Listen to music together with perfect timing
- **Love-themed Design** - Beautiful pink/red gradient design with heart animations
- **File Upload System** - Upload your own music files (MP3, WAV, OGG, M4A, AAC, FLAC)
- **Real-time Chat** - Chat with others in the room with love-themed messages
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Track Management** - Organize tracks with tabs for all tracks and uploaded content
- **User-friendly Interface** - Clean, modern UI with smooth animations

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

## 🎵 How to Use

### Joining a Room
1. Enter your name and choose a room name
2. Click "Join Room" to enter the music room
3. Share the room name with friends to invite them

### Listening to Music
1. Browse available tracks in the "All Tracks" tab
2. Click on any track to start playing for everyone in the room
3. Use the music controls to play, pause, and navigate tracks
4. All users in the room will hear the same music synchronized

### Uploading Your Music
1. Click "Choose audio file" to select your music file
2. Enter a title for your song
3. Click "Upload Song" to share it with the room
4. Your uploaded tracks appear in the "Uploaded" tab

### Chatting
1. Type your message in the chat input
2. Press Enter or click the send button
3. Messages appear in real-time for all room members

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Upload**: Multer
- **Real-time Communication**: Socket.IO
- **Audio Playback**: HTML5 Audio API

## 📁 Project Structure

```
love-music-room/
├── public/
│   ├── index.html      # Main application interface
│   ├── styles.css      # Love-themed styling
│   └── app.js          # Frontend JavaScript logic
├── uploads/            # Directory for uploaded music files
├── server.js           # Backend server with Socket.IO
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🎨 Design Features

- **Love Theme**: Pink and red gradient backgrounds with heart animations
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: Fade-in effects and hover animations
- **Modern UI**: Clean, intuitive interface with proper spacing
- **Accessibility**: High contrast and readable fonts

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🔧 Customization

### Changing the Theme
Modify the color variables in `public/styles.css`:
```css
/* Love theme colors */
--primary-color: #e91e63;
--secondary-color: #ff6b9d;
--accent-color: #ffb3d1;
```

### Adding More Sample Tracks
Edit the `sampleTracks` array in `server.js`:
```javascript
const sampleTracks = [
    {
        id: 1,
        title: "Your Song Title",
        artist: "Artist Name",
        url: "https://example.com/song.mp3",
        duration: 180,
        cover: "https://example.com/cover.jpg",
        isUploaded: false
    }
];
```

## 🔒 Security Features

- File type validation for uploads
- File size limits (50MB max)
- Secure file naming with unique identifiers
- Input sanitization for chat messages

## 📊 File Upload Specifications

- **Supported Formats**: MP3, WAV, OGG, M4A, AAC, FLAC
- **Maximum Size**: 50MB per file
- **Storage**: Files stored locally in `uploads/` directory
- **Naming**: Unique filenames to prevent conflicts

## 🚀 Deployment

### Local Development
```bash
npm install
npm start
```

### Production Deployment
1. Set environment variables:
   ```bash
   PORT=3000
   NODE_ENV=production
   ```

2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "love-music-room"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 💝 Support

If you love this project and want to support it:
- Star the repository
- Share with friends
- Report bugs or suggest features
- Contribute code improvements

---

**Made with 💕 for music lovers everywhere** 