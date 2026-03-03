const express = require("express");
const { handleRequests } = require("../controllers/handleRequests");
const router = express.Router();

router
    .get("/whatsapp-bot", handleRequests)

module.exports = router