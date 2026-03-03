const express = require("express");
const { send_messages } = require("../controllers/send_messages");
const router = express.Router();

router
    .post("/messages/send", send_messages)

module.exports = router
