# Frontend - WebRTC Meet (PORTAL)

A real-time video conferencing application built with vanilla JavaScript and WebRTC technology. This frontend enables users to create and join video call rooms for various purposes including gaming, language practice, learning, business meetings, and coding collaboration.

## 🚀 Features

- **User Authentication**: Secure login and signup system
- **Room Management**: 
  - Create public or private rooms
  - Join rooms by code or browse public rooms
  - Filter rooms by category (Games, Languages, Learning, Business, Coding)
  - Search functionality for rooms
- **Real-Time Video Calls**:
  - WebRTC-based peer-to-peer video and audio communication
  - Mute/unmute microphone
  - Start/stop video camera
  - Low-latency communication
- **Room Types**: Support for multiple room categories
  - Games
  - Language practice
  - Learning sessions
  - Business meetings
  - Coding collaboration

## 📁 Project Structure

```
FRONTEND/
├── index.html          # Landing page
├── style.css           # Landing page styles
├── script.js           # Landing page scripts
├── app/                # Main application
│   ├── app.html        # Main app interface
│   ├── app.css         # App styles
│   └── app.js          # App logic (WebRTC, Socket.IO)
├── login/              # Login page
│   ├── login.html
│   ├── login.css
│   └── login.js
├── signup/             # Signup page
│   ├── signup.html
│   ├── signup.css
│   └── signup.js
└── assets/             # Images and static assets
    ├── 5portal-white.png
    ├── 5portal.png
    └── meet.png
```

## 🛠️ Technologies Used

- **HTML5**: Structure and markup
- **CSS3**: Styling and responsive design
- **Vanilla JavaScript**: Core functionality
- **WebRTC**: Peer-to-peer video/audio communication
- **Socket.IO**: Real-time signaling and room management (via CDN)

## 📋 Prerequisites

- A modern web browser with WebRTC support (Chrome, Firefox, Edge, Safari)
- A backend server running (see BACKEND directory)
- HTTPS connection (required for WebRTC in production)

## 🚀 Getting Started

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd FRONTEND
   ```

2. The frontend uses no build tools or package managers. Simply serve the files using a web server.

### Running Locally

#### Option 1: Using a Simple HTTP Server

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

#### Option 2: Using Live Server (VS Code Extension)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

### Accessing the Application

Once the server is running, open your browser and navigate to:
```
http://localhost:8000
```

## 🔧 Configuration

### Backend Connection

The frontend connects to a backend server for authentication and room management. Make sure to configure the backend URL in the JavaScript files if needed.

The application uses Socket.IO for real-time communication. The Socket.IO client is loaded via CDN:
```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
```

### Environment Setup

If you need to configure the backend API endpoint, update the relevant JavaScript files (`app.js`, `login.js`, `signup.js`) with your backend server URL.

## 📱 Usage

### Landing Page
- Visit the landing page to learn about the application
- Click "Get Started" to sign up or "I already have an account" to login

### Authentication
1. **Sign Up**: Create a new account with email/username and password
2. **Login**: Sign in with your credentials

### Main Application
1. **Create a Room**: Click "+ Add room" to create a new room
   - Enter room name
   - Select room type (Game, Language, Learning, Business, Coding)
   - Choose visibility (Public or Private)
   
2. **Browse Rooms**: 
   - View all public rooms
   - Filter by category using the filter chips
   - Search for specific rooms
   
3. **Join Private Room**: 
   - Switch to "Join Private Room" view
   - Enter the room code provided by the room creator
   
4. **Video Call**:
   - Click on a room to join
   - Allow camera and microphone permissions
   - Use controls to mute/unmute or stop/start video
   - Click "Leave" to exit the call

## 🎨 UI/UX Features

- Responsive design for desktop and mobile devices
- Modern and clean interface
- Intuitive navigation
- Real-time room updates
- Profile dropdown with logout functionality

## 🔒 Security Considerations

- User authentication required for accessing rooms
- Private rooms protected by room codes
- WebRTC uses secure peer-to-peer connections
- HTTPS recommended for production deployment

## 🌐 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: WebRTC requires modern browsers with full support. Some features may not work in older browsers.

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Ensure you've granted browser permissions for camera and microphone
- Check browser settings for site permissions
- Try refreshing the page

### Cannot Connect to Backend
- Verify the backend server is running
- Check network connectivity
- Verify CORS settings on the backend

### Rooms Not Loading
- Check browser console for errors
- Verify Socket.IO connection is established
- Ensure backend API is accessible

## 📝 Development Notes

- The application uses vanilla JavaScript (no frameworks)
- Socket.IO is loaded via CDN (version 4.7.2)
- WebRTC implementation handles peer connections and media streams
- All styling is done with CSS (no CSS frameworks)

## 🤝 Contributing

When contributing to the frontend:
1. Maintain code style consistency
2. Test in multiple browsers
3. Ensure responsive design works on mobile devices
4. Update this README if adding new features

## 📄 License

See the main project README for license information.

## 🔗 Related

- [Backend Documentation](../BACKEND/README.md)
- [Main Project README](../README.md)

