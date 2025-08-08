// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const chatRoom = document.getElementById('chat-room');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const roomNameInput = document.getElementById('room-name');
const leaveBtn = document.getElementById('leave-btn');
const roomTitle = document.getElementById('room-title');
const userCount = document.getElementById('user-count');

// Music Player Elements
const currentTrackTitle = document.getElementById('current-track-title');
const currentTrackArtist = document.getElementById('current-track-artist');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressFill = document.getElementById('progress-fill');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');

// Upload Elements
const uploadForm = document.getElementById('upload-form');
const songFile = document.getElementById('song-file');
const songTitle = document.getElementById('song-title');
const uploadProgress = document.getElementById('upload-progress');
const uploadFill = document.getElementById('upload-fill');
const uploadStatus = document.getElementById('upload-status');

// Track Elements
const tracksContainer = document.getElementById('tracks-container');
const tabBtns = document.querySelectorAll('.tab-btn');

// Chat Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// State Variables
let socket = null;
let currentUsername;
let currentRoom;
let currentTrack = null;
let isPlaying = false;
let currentTime = 0;
let availableTracks = [];
let currentTab = 'all';

// Audio Element
const audio = new Audio();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up event listeners...');
    console.log('Progress fill element:', progressFill);
    console.log('Current time display:', currentTimeDisplay);
    console.log('Total time display:', totalTimeDisplay);
    
    setupEventListeners();
    setupAudioEventListeners();
    setupMobileOptimizations();
});

function setupMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input[type="text"], input[type="file"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // Prevent zoom on iOS
            if (window.innerWidth <= 768) {
                input.style.fontSize = '16px';
            }
        });
        
        input.addEventListener('blur', () => {
            // Restore font size if needed
            if (window.innerWidth <= 768) {
                input.style.fontSize = '';
            }
        });
    });
    
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
    });
    
    // Improve touch scrolling
    const scrollableElements = document.querySelectorAll('.chat-messages, .track-list, .music-player');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
    });
    
    // Handle viewport height issues on mobile
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
}

function setupEventListeners() {
    // Join Room
    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const roomName = roomNameInput.value.trim();
        
        if (username && roomName) {
            currentUsername = username;
            currentRoom = roomName;
            joinRoom(username, roomName);
        }
    });

    // Leave Room
    leaveBtn.addEventListener('click', () => {
        if (socket) {
            socket.disconnect();
        }
        showWelcomeScreen();
    });

    // Upload Form
    uploadForm.addEventListener('submit', handleFileUpload);

    // Track Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderTracks();
        });
    });

    // Chat
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Music Controls
    playPauseBtn.addEventListener('click', () => {
        if (currentTrack) {
            const newPlayingState = !isPlaying;
            socket.emit('playMusic', { 
                room: currentRoom, 
                track: currentTrack,
                isPlaying: newPlayingState,
                currentTime: audio.currentTime || 0
            });
        }
    });

    // File Input Change
    songFile.addEventListener('change', () => {
        const file = songFile.files[0];
        if (file) {
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            songTitle.value = fileName;
        }
    });

    // Progress Bar Timeline Click
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.addEventListener('click', (e) => {
        if (!currentTrack || isNaN(audio.duration)) return;
        
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const containerWidth = rect.width;
        const clickPercent = clickX / containerWidth;
        const newTime = clickPercent * audio.duration;
        
        // Update audio time
        audio.currentTime = newTime;
        
        // Update progress bar
        progressFill.style.width = (clickPercent * 100) + '%';
        currentTimeDisplay.textContent = formatTime(newTime);
        
        // Visual feedback
        progressContainer.style.transform = 'scale(1.02)';
        setTimeout(() => {
            progressContainer.style.transform = 'scale(1)';
        }, 150);
        
        // Sync with other users in the room
        if (socket && currentTrack) {
            socket.emit('playMusic', {
                room: currentRoom,
                track: currentTrack,
                isPlaying: isPlaying,
                currentTime: newTime
            });
        }
    });

    // Progress Bar Hover Effect
    progressContainer.addEventListener('mousemove', (e) => {
        if (!currentTrack || isNaN(audio.duration)) return;
        
        const rect = progressContainer.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        const containerWidth = rect.width;
        const hoverPercent = hoverX / containerWidth;
        const hoverTime = hoverPercent * audio.duration;
        
        // Show tooltip with time
        progressContainer.title = `Jump to ${formatTime(hoverTime)}`;
        
        // Update hover preview
        progressContainer.style.setProperty('--hover-percent', `${hoverPercent * 100}%`);
    });

    // Remove hover effect when mouse leaves
    progressContainer.addEventListener('mouseleave', () => {
        progressContainer.title = '';
        progressContainer.style.removeProperty('--hover-percent');
    });

    // Touch support for mobile devices
    progressContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = progressContainer.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const containerWidth = rect.width;
        const touchPercent = touchX / containerWidth;
        const newTime = touchPercent * audio.duration;
        
        if (!currentTrack || isNaN(audio.duration)) return;
        
        // Update audio time
        audio.currentTime = newTime;
        
        // Update progress bar
        progressFill.style.width = (touchPercent * 100) + '%';
        currentTimeDisplay.textContent = formatTime(newTime);
        
        // Visual feedback
        progressContainer.style.transform = 'scale(1.02)';
        setTimeout(() => {
            progressContainer.style.transform = 'scale(1)';
        }, 150);
        
        // Sync with other users in the room
        if (socket && currentTrack) {
            socket.emit('playMusic', {
                room: currentRoom,
                track: currentTrack,
                isPlaying: isPlaying,
                currentTime: newTime
            });
        }
    });
}

function setupAudioEventListeners() {
    // Initialize progress bar
    progressFill.style.width = '0%';
    currentTimeDisplay.textContent = '0:00';
    
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = progress + '%';
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
            console.log('Progress updated:', progress + '%', 'Current time:', audio.currentTime);
        }
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseButtons();
    });

    audio.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audio.duration);
    });

    // Add play/pause event listeners
    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseButtons();
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseButtons();
    });

    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        isPlaying = false;
        updatePlayPauseButtons();
        showNotification('Error playing audio', 'error');
    });
}

function joinRoom(username, roomName) {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('joinRoom', { username, room: roomName });
    });

    socket.on('roomJoined', (data) => {
        showChatRoom();
        roomTitle.textContent = roomName;
        userCount.textContent = `${data.userCount} user${data.userCount !== 1 ? 's' : ''} online`;
        availableTracks = data.tracks || [];
        renderTracks();
        addMessage(`💕 ${username} joined the room!`, 'system');
    });

    socket.on('userJoined', (data) => {
        userCount.textContent = `${data.userCount} user${data.userCount !== 1 ? 's' : ''} online`;
        addMessage(`💕 ${data.username} joined the room!`, 'system');
    });

    socket.on('userLeft', (data) => {
        userCount.textContent = `${data.userCount} user${data.userCount !== 1 ? 's' : ''} online`;
        addMessage(`👋 ${data.username} left the room`, 'system');
    });

    socket.on('message', (data) => {
        addMessage(data.message, data.username === currentUsername ? 'own' : 'other', data.username);
    });

    socket.on('playMusic', (data) => {
        if (!data.track) {
            console.error('No track data received in playMusic event');
            return;
        }
        
        currentTrack = data.track;
        isPlaying = data.isPlaying;
        currentTime = data.currentTime || 0;

        console.log('Playing track:', currentTrack);
        console.log('Audio URL:', currentTrack.url);
        console.log('Is playing:', isPlaying);

        // Check if track has a valid URL
        if (!currentTrack.url) {
            console.error('Track has no URL:', currentTrack);
            addMessage(`❌ Error: Track has no URL`, 'system');
            return;
        }

        // Only set new source if track changed
        if (audio.src !== currentTrack.url) {
            audio.src = currentTrack.url;
        }
        
        audio.currentTime = currentTime;

        audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
            addMessage(`❌ Error loading audio: ${currentTrack.title}`, 'system');
            isPlaying = false;
            updatePlayPauseButtons();
        });

        audio.addEventListener('canplay', () => {
            console.log('Audio can play:', currentTrack.title);
            console.log('Audio duration:', audio.duration);
            console.log('Current time:', audio.currentTime);
            
            // Update progress bar immediately when audio is ready
            if (!isNaN(audio.duration)) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = progress + '%';
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
                totalTimeDisplay.textContent = formatTime(audio.duration);
                console.log('Progress bar updated on canplay:', progress + '%');
            }
            
            if (isPlaying) {
                audio.play().catch(error => {
                    console.error('Audio play error:', error);
                    addMessage(`❌ Error playing audio: ${currentTrack.title}`, 'system');
                    isPlaying = false;
                    updatePlayPauseButtons();
                });
            } else {
                audio.pause();
            }
        });

        updateMusicDisplay();
        updatePlayPauseButtons();
    });

    socket.on('newTrackUploaded', (track) => {
        availableTracks.push(track);
        renderTracks();
    });

    socket.on('trackDeleted', (data) => {
        availableTracks = availableTracks.filter(track => track.id !== data.trackId);
        renderTracks();
    });

    // Audio sharing event from mobile app
    socket.on('audioShared', (data) => {
        console.log('Audio shared from mobile:', data);
        if (data.audio) {
            // Convert audio data to track format for web player
            const track = {
                id: data.audio.id,
                title: data.audio.title,
                url: data.audio.url,
                uploadedBy: data.audio.sharedBy || data.username
            };
            
            console.log('Playing shared audio:', track);
            
            // Set as current track and play
            currentTrack = track;
            
            // Ensure URL is properly formatted
            let audioUrl = track.url;
            if (audioUrl && !audioUrl.startsWith('http')) {
                audioUrl = `https://beat-9igu.onrender.com${audioUrl}`;
            }
            
            console.log('Setting audio source:', audioUrl);
            audio.src = audioUrl;
            audio.currentTime = 0;
            
            audio.addEventListener('canplay', () => {
                console.log('Shared audio can play:', track.title);
                audio.play().catch(error => {
                    console.error('Error playing shared audio:', error);
                    showNotification(`Error playing ${track.title}`, 'error');
                });
            }, { once: true });
            
            audio.addEventListener('error', (e) => {
                console.error('Audio loading error for shared track:', e);
                console.error('Audio URL was:', audioUrl);
                showNotification(`Error loading ${track.title}`, 'error');
            });
            
            isPlaying = true;
            updateMusicDisplay();
            updatePlayPauseButtons();
            
            // Add message to chat (only if it's from another user)
            if (data.username !== currentUsername) {
                addMessage(`🎵 ${data.username} is playing: ${track.title}`, 'system');
                showNotification(`${data.username} started playing ${track.title}`, 'info');
            } else {
                addMessage(`🎵 You started playing: ${track.title}`, 'system');
            }
        }
    });

    // Audio synchronization events for floating player
    socket.on('audioReady', (data) => {
        console.log('Audio ready:', data);
        showNotification(`${data.username} loaded audio`, 'info');
    });

    socket.on('audioPlaySync', (data) => {
        console.log('Audio play sync:', data);
        if (data.username !== currentUsername) {
            showNotification(`${data.username} started playing`, 'info');
            // If we have the same audio loaded, sync with them
            if (audio.src && audio.src.includes(data.audioId)) {
                audio.currentTime = data.currentTime || 0;
                audio.play();
                isPlaying = true;
                updatePlayPauseButtons();
            }
        }
    });

    socket.on('audioPauseSync', (data) => {
        console.log('Audio pause sync:', data);
        if (data.username !== currentUsername) {
            showNotification(`${data.username} paused`, 'info');
            // If we have the same audio loaded, sync with them
            if (audio.src && audio.src.includes(data.audioId)) {
                audio.pause();
                isPlaying = false;
                updatePlayPauseButtons();
            }
        }
    });

    socket.on('audioStopSync', (data) => {
        console.log('Audio stop sync:', data);
        if (data.username !== currentUsername) {
            showNotification(`${data.username} stopped`, 'info');
            // If we have the same audio loaded, sync with them
            if (audio.src && audio.src.includes(data.audioId)) {
                audio.pause();
                audio.currentTime = 0;
                isPlaying = false;
                currentTime = 0;
                updatePlayPauseButtons();
                updateMusicDisplay();
            }
        }
    });

    socket.on('audioSeekSync', (data) => {
        console.log('Audio seek sync:', data);
        if (data.username !== currentUsername) {
            // If we have the same audio loaded, sync with them
            if (audio.src && audio.src.includes(data.audioId)) {
                audio.currentTime = data.currentTime || 0;
                currentTime = data.currentTime || 0;
                updateMusicDisplay();
            }
        }
    });

    socket.on('audioProgressSync', (data) => {
        // Update progress if we're playing the same audio
        if (audio.src && audio.src.includes(data.audioId) && data.username !== currentUsername) {
            currentTime = data.currentTime || 0;
            updateMusicDisplay();
        }
    });
}

function showWelcomeScreen() {
    welcomeScreen.style.display = 'block';
    chatRoom.style.display = 'none';
    joinForm.reset();
}

function showChatRoom() {
    welcomeScreen.style.display = 'none';
    chatRoom.style.display = 'block';
}

function handleFileUpload(e) {
    e.preventDefault();
    const file = songFile.files[0];
    const title = songTitle.value.trim();

    if (!file || !title) {
        showNotification('Please fill in song title and select a file', 'error');
        return;
    }

    // Client-side file type validation
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/ogg', 'audio/oga', 'audio/m4a', 'audio/aac', 'audio/flac', 'audio/x-flac', 'audio/webm', 'audio/mp4', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid file type. Please upload an audio file (MP3, WAV, OGG, M4A, AAC, FLAC).', 'error');
        return;
    }

    // Client-side file size validation (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File too large. Maximum size is 50MB.', 'error');
        return;
    }

    uploadFile(file, title);
}

function uploadFile(file, title) {
    const formData = new FormData();
    formData.append('song', file);
    formData.append('title', title);
    formData.append('username', currentUsername);

    uploadProgress.style.display = 'block';
    uploadFill.style.width = '0%';
    uploadStatus.textContent = 'Uploading...';

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            uploadFill.style.width = percentComplete + '%';
            uploadStatus.textContent = `Uploading... ${Math.round(percentComplete)}%`;
        }
    });

    xhr.addEventListener('load', () => {
        uploadProgress.style.display = 'none';
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            uploadStatus.textContent = response.message;
            uploadForm.reset();
            showNotification('Song uploaded successfully! 💕', 'success');
        } else {
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                uploadStatus.textContent = errorResponse.error || 'Upload failed. Please try again.';
                showNotification(errorResponse.error || 'Upload failed', 'error');
            } catch (e) {
                uploadStatus.textContent = 'Upload failed. Please try again.';
                showNotification('Upload failed', 'error');
            }
            uploadFill.style.width = '0%';
        }
    });

    xhr.addEventListener('error', () => {
        uploadProgress.style.display = 'none';
        uploadStatus.textContent = 'Upload failed. Please try again.';
        uploadFill.style.width = '0%';
        showNotification('Upload failed', 'error');
    });

    xhr.open('POST', '/upload-song');
    xhr.send(formData);
}

function renderTracks() {
    const filteredTracks = currentTab === 'all' ? availableTracks : availableTracks.filter(track => track.isUploaded);
    
    if (filteredTracks.length === 0) {
        tracksContainer.innerHTML = '<div class="no-tracks">No tracks available</div>';
        return;
    }

    tracksContainer.innerHTML = filteredTracks.map(track => {
        const uploadedInfo = track.isUploaded ? `
            <div class="track-uploaded-by">Uploaded by ${track.uploadedBy}</div>
            <button class="delete-track-btn" onclick="deleteTrack(${track.id})">
                <i class="fas fa-trash"></i>
            </button>
        ` : '';

        return `
            <div class="track-item ${track.isUploaded ? 'uploaded' : ''}" onclick="playTrack(${track.id})">
                <img src="${track.cover}" alt="${track.title}" class="track-cover">
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                    ${uploadedInfo}
                </div>
            </div>
        `;
    }).join('');
}

function playTrack(trackId) {
    const track = availableTracks.find(t => t.id === trackId);
    if (track) {
        socket.emit('playMusic', { 
            room: currentRoom, 
            track: track, 
            isPlaying: true 
        });
    }
}

function deleteTrack(trackId) {
    if (confirm('Are you sure you want to delete this track?')) {
        fetch(`/api/tracks/${trackId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                availableTracks = availableTracks.filter(track => track.id !== trackId);
                renderTracks();
                showNotification('Track deleted successfully!', 'success');
            } else {
                showNotification('Failed to delete track', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting track:', error);
            showNotification('Failed to delete track', 'error');
        });
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && socket) {
        socket.emit('message', { 
            room: currentRoom, 
            message: message, 
            username: currentUsername 
        });
        messageInput.value = '';
    }
}

function addMessage(message, type, username = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    if (type === 'own' || type === 'other') {
        messageDiv.innerHTML = `
            <div class="message-username">${username}</div>
            <div class="message-content">${message}</div>
        `;
    } else {
        messageDiv.innerHTML = message;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMusicDisplay() {
    if (currentTrack) {
        currentTrackTitle.textContent = currentTrack.title;
        currentTrackArtist.textContent = currentTrack.artist;
    } else {
        currentTrackTitle.textContent = 'No track playing';
        currentTrackArtist.textContent = 'Select a track to start';
    }
}

function updatePlayPauseButtons() {
    const hasTrack = currentTrack !== null;
    playPauseBtn.disabled = !hasTrack;

    if (hasTrack) {
        const icon = playPauseBtn.querySelector('i');
        if (isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    } else {
        const icon = playPauseBtn.querySelector('i');
        icon.className = 'fas fa-play';
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 