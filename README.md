# Flash Mail - Temporary Email Service

Flash Mail is a web-based application that provides temporary email addresses for users who want to protect their privacy. Generate disposable email addresses instantly without any registration process.

## Features

- 📧 Instant temporary email address generation
- 📥 Real-time email reception
- 🔍 Search through received emails
- ⏰ Automatic email expiration
- 📱 Responsive design for desktop and mobile
- 🔒 Secure email handling

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Email Service: Mailgun
- Real-time updates: Socket.IO

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Mailgun account
- npm or yarn

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/flashmail.git
cd flashmail
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Set up environment variables
```bash
# In the server directory
cp .env.example .env
```
Edit the .env file with your configuration

4. Start the development servers
```bash
# Start backend server
cd server
npm run dev

# Start frontend development server
cd client
npm start
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/flashmail
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
JWT_SECRET=your_jwt_secret
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 