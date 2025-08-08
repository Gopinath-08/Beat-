# 🎵 Beat - Real-time Music Sharing App

A React Native mobile application that allows users to share music and chat in real-time with their loved ones. Built with the latest React Native community version and connected to a Node.js backend.

## ✨ Features

- **Real-time Music Sharing** - Listen to music together with friends and family
- **Live Chat** - Send messages in real-time while enjoying music
- **File Upload** - Upload your own audio files (MP3, WAV, OGG, M4A)
- **Music Player** - Full-featured music player with progress controls
- **Room-based System** - Join private rooms to share music with specific people
- **Track Management** - View all tracks and manage uploaded songs
- **Responsive Design** - Beautiful UI optimized for mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Beat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Start the Metro bundler**
   ```bash
   npx react-native start
   ```

5. **Run the app**

   **For Android:**
   ```bash
   npx react-native run-android
   ```

   **For iOS:**
   ```bash
   npx react-native run-ios
   ```

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── MusicPlayer.tsx  # Music player with controls
│   ├── ChatSection.tsx  # Real-time chat interface
│   ├── TrackList.tsx    # Track listing and management
│   └── UploadSection.tsx # File upload functionality
├── screens/             # App screens
│   ├── WelcomeScreen.tsx # Welcome/login screen
│   └── ChatRoomScreen.tsx # Main chat room interface
├── services/            # API and socket services
│   ├── apiService.ts    # HTTP API calls
│   └── socketService.ts # Real-time communication
├── types/               # TypeScript type definitions
│   └── index.ts
└── utils/               # Utility functions
    └── audioUtils.ts    # Audio-related utilities
```

## 🔧 Configuration

### Backend Connection

The app connects to the backend server at `https://beat-9igu.onrender.com`. You can change this URL in:

- `src/services/socketService.ts` (line 5)
- `src/services/apiService.ts` (line 3)

### Supported Audio Formats

- MP3
- WAV
- OGG
- M4A
- AAC
- FLAC

### File Size Limit

Maximum file size: 50MB

## 🎨 UI/UX Features

- **Love Theme** - Pink/red color scheme with heart icons
- **Responsive Design** - Optimized for various screen sizes
- **Smooth Animations** - Fluid transitions and interactions
- **Intuitive Navigation** - Easy-to-use interface
- **Real-time Updates** - Live synchronization across devices

## 🔌 Dependencies

### Core Dependencies
- `react-native` - React Native framework
- `@react-navigation/native` - Navigation library
- `@react-navigation/stack` - Stack navigation
- `socket.io-client` - Real-time communication
- `react-native-track-player` - Music playback
- `react-native-sound` - Audio handling
- `react-native-document-picker` - File selection
- `react-native-vector-icons` - Icon library

### Development Dependencies
- `typescript` - Type safety
- `@types/react-native` - TypeScript definitions
- `eslint` - Code linting
- `prettier` - Code formatting

## 📱 Screenshots

### Welcome Screen
- Clean login interface
- Username and room name input
- Heart-themed design

### Chat Room
- Music player with progress bar
- Real-time chat interface
- Track listing with tabs
- File upload section

## 🚀 Deployment

### Android
1. Generate a signed APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. The APK will be available at:
   `android/app/build/outputs/apk/release/app-release.apk`

### iOS
1. Open the project in Xcode
2. Configure signing and capabilities
3. Build and archive for App Store distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include device information and error logs

## 🔗 Links

- **Backend Repository**: [Link to backend repo]
- **Live Demo**: [https://beat-9igu.onrender.com/](https://beat-9igu.onrender.com/)
- **Documentation**: [Link to docs]

---

Made with ❤️ for music lovers everywhere 