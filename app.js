require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const errorHandler = require('./middlewares/errorHandler.js')
const { startWhatsAppBot } = require('./services/whatsapp-bot.js')
const router = require('./routes/routers.js')

// APP SETUP
const app = express();
const PORT = process.env.PORT || 3005

// middlewares handling
app
    .use(morgan('short'))
    .use(express.json())
    .use("/api", router)

// Start WhatsApp bot
startWhatsAppBot().catch(error => {
    console.error('Fatal error:', error.stack)
    process.exit(1)
});

// Calling error handler middleware
app.use(errorHandler);

process.on('uncaughtException', async (err, req, res, next) => {
    console.error({
        msg: 'Uncaught Exception',
        err: err?.stack
    });
})

process.on('unhandledRejection', (reason, promise) => {
    console.error(' Promise Rejection:', reason);
});

app.listen(PORT, () => {
    const url = `http://localhost:${PORT}/api/whatsapp-bot`;
    console.log('Server running on port', PORT)
    console.log('API endpoint:', url)
});