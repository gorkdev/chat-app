# 💬 Real-time Chat Application

A modern, real-time chat application built with **Nuxt.js 3**, **Node.js**, **Socket.io**, and **MongoDB**.

## ✨ Features

- 🔐 **User Authentication** - Secure login/registration with password hashing
- 💬 **Real-time Messaging** - Instant message delivery with Socket.io
- 👥 **Online Users** - Live user presence and status updates
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 💾 **Message History** - Paginated message loading from database
- 🔄 **Auto-reconnect** - Persistent login across page refreshes
- ⚡ **Modern UI** - Clean, minimalist design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone
   cd chat-app
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd frontend
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Create .env file in server directory
   cd server
   cp .env.example .env
   ```

   Edit `.env` file:

   ```env
   MONGO_URI=mongodb://localhost:27017/chat-app
   PORT=5000
   ```

4. **Start the application**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
chat-app/
├── frontend/                 # Nuxt.js 3 frontend
│   ├── components/          # Vue components
│   │   ├── LoginForm.vue    # Login/Register form
│   │   ├── LoginOrChat.vue  # Main chat component
│   │   ├── ChatBox.vue      # Message display
│   │   └── MessageInput.vue # Message input
│   ├── pages/              # Nuxt pages
│   └── nuxt.config.ts      # Nuxt configuration
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   │   ├── user.js        # User schema
│   │   └── message.js     # Message schema
│   ├── index.js           # Main server file
│   └── package.json       # Backend dependencies
└── README.md
```

## 🛠️ Tech Stack

### Frontend

- **Nuxt.js 3** - Vue.js framework
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Vue 3 Composition API** - Modern Vue.js features

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing

## 🔧 API Endpoints

### REST API

- `GET /api/messages` - Get paginated messages
- `GET /api/users/online` - Get online users

### Socket Events

- `user_auth` - User login/registration
- `check_username` - Check username availability
- `send_message` - Send new message
- `user_reconnect` - User reconnection

## 🎨 UI Features

- **Clean Design** - Minimalist white theme
- **Auto-dismissing Alerts** - System messages disappear after 3 seconds
- **Message Bubbles** - Different styles for own/other messages
- **Online User List** - Real-time user presence
- **Responsive Layout** - Mobile-friendly design
- **Loading States** - Smooth user experience

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ SQL injection prevention (NoSQL)

## 📱 Usage

1. **Register/Login** - Enter username and password
2. **Start Chatting** - Send messages in real-time
3. **See Online Users** - View who's currently online
4. **Message History** - Load previous messages with pagination
5. **Stay Connected** - Login persists across page refreshes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Made with ❤️ by [gorkdev]
