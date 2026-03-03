const { format_msg } = require("../utils/format_msg");

async function errorHandler(err, req, res, next) {
    try {
        if (err) {
            console.log("Global error message : ", err.message)
            return res.status(500).json(format_msg("Internal Server Error", null, true));
        };
        return next()
    }
    catch (error) {
        console.log("Gloable Error handler message : ", error.message)
        console.log("Gloable Error handler stack : ", error.stack)
    }
};

module.exports = errorHandler