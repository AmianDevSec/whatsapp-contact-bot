const express = require("express");
const { handleRequests } = require("../controllers/handleRequests");
const router = express.Router();

router
    .post("/messages/send", handleRequests)

module.exports = router
