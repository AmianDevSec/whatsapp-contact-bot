const { sendMessage } = require("../services/whatsapp-bot");
const { format_msg } = require("../utils/format_msg");

/**
 * @param {String} msg 
 * @param {Number} uniqueId 
 * @returns {String}
 */
const message_to_send = (msg, uniqueId) => `⚡ Message ID : ${uniqueId}

${msg}
`;

/**
 * @param {Object} req 
 * @param {Object} res 
 * @returns
 */
const handleRequests = async (req, res) => {
    try {
        const data = req.data;
        const {number, message} = data;
        // const query = req.query;

        // const number = data?.number || query?.number;
        // const message = data?.message || query?.message;
        
        if (!number || !message) {
            res.status(400).json(format_msg("Missing 'number' or 'message' parameter", null, true));
            return;
        }

        const uniqueId = Math.floor(Math.random() * 10000); // tiny random ID
        await sendMessage(number, message_to_send(message, uniqueId));

        res.status(200).json(format_msg('Message sent successfully'));
        return;
    } catch (error) {
        console.log("handleRequests error : ", error.message);
        res.status(500).json(format_msg("Internal Server Error", null, true));
        return;
    }
}

module.exports = { handleRequests };
