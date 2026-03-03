# WhatsApp Contact Bot

A Node.js-based WhatsApp bot application designed to manage and handle contact information and automated messaging through the WhatsApp Business API.

## 🎯 Project Overview

This project implements a contact management bot for WhatsApp that enables automated communication and contact handling. It follows a modular, enterprise-level architecture with clear separation of concerns using controllers, middlewares, routes, and services.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Contact Management**: Manage WhatsApp contacts efficiently
- **Automated Messaging**: Send automated messages via WhatsApp
- **Middleware Support**: Custom middleware for request processing
- **RESTful API**: Clean and organized route structure
- **Modular Architecture**: Scalable and maintainable codebase
- **Environment Configuration**: Secure configuration management

## 📁 Project Structure

```
whatsapp-contact-bot/
├── app.js                 # Main application entry point
├── package.json          # Project dependencies and metadata
├── package-lock.json     # Locked dependency versions
├── .env                  # Environment variables configuration
├── .gitignore           # Git ignore rules
├── controllers/         # Request handlers and business logic
├── middlewares/         # Custom middleware functions
├── routes/             # API route definitions
├── services/           # Business logic and API integrations
└── utils/              # Utility functions and helpers
```

### Directory Descriptions

| Directory | Purpose |
|-----------|---------|
| **controllers/** | Handles incoming HTTP requests and responses, controls application flow |
| **middlewares/** | Custom middleware for authentication, validation, logging, error handling |
| **routes/** | API endpoint definitions and routing configuration |
| **services/** | Core business logic, external API calls, data processing |
| **utils/** | Reusable utility functions, helpers, and common tools |

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (inferred from structure)
### Dependencies

Core dependencies include:
- WhatsApp Business API client library
- HTTP server framework
- Additional libraries (see `package.json`)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmianDevSec/whatsapp-contact-bot.git
   cd whatsapp-contact-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## ⚙️ Configuration

### Environment Variables

Configure the following variables in your `.env` file:

```env
# Server Configuration
PORT=4590

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER=2250505050505  # Your whatsapp number including country code without + .
```

## 🚀 Usage

### Starting the Application

```bash
npm start
```

The bot will start listening on the configured port (default: 4590).

### Development Mode

For development with auto-reload:

```bash
npm run dev
```

## 🔌 API Endpoints

The application provides the following endpoint categories:

| Category | Purpose |
|----------|---------|
| **Messages** | Send WhatsApp messages |


### Example Endpoints

- `POST /api/messages/send` - Send a WhatsApp message

### Component Descriptions

1. **Routes**: Define API endpoints and map them to controllers
2. **Middlewares**: Handle cross-cutting concerns (auth, validation, logging)
3. **Controllers**: Orchestrate request handling and response
4. **Services**: Contain business logic and integrate with external APIs
5. **Utils**: Provide reusable functions and utilities

## 👨‍💻 Development

### Adding New Features

1. **Create route** in `routes/`
2. **Create controller** in `controllers/` to handle the route
3. **Create service** in `services/` for business logic
4. **Add utilities** in `utils/` as needed
5. **Add middleware** in `middlewares/` for request processing

## 📝 Scripts

Available npm scripts:

```bash
npm start       # Start the production server
npm run dev     # Start the development server with auto-reload
npm test        # Run test suite
npm run lint    # Run linter
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🆘 Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Open an issue](https://github.com/AmianDevSec/whatsapp-contact-bot/issues)
- **Email**: [Contact the maintainer]

## 🔐 Security

- Never commit `.env` files to version control
- Use environment variables for sensitive data
- Keep dependencies updated regularly
- Follow WhatsApp API security best practices

## 📚 Additional Resources

- [Baileys GitHub Repository](https://github.com/WhiskeySockets/Baileys)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/)
- [WhatsApp Terms of Service](https://www.whatsapp.com/legal/terms-of-service)

## ⚠️ Disclaimer

This project uses Baileys, which is a WhatsApp Web automation library. Using this library may violate WhatsApp's Terms of Service. Use at your own risk and ensure compliance with WhatsApp policies.

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Author**: [AmianDevSec](https://github.com/AmianDevSec)

Made with ❤️ using Node.js, Express.js, and Baileys
