require('dotenv').config();
const { TWILIO_SID, TWILIO_TOKEN, YOUR_PHONE, TWILIO_PHONE } = process.env;
const twilio = require('twilio');
const client = twilio(TWILIO_SID, TWILIO_TOKEN);

function notifyUserViaText(notification) {
    return new Promise((resolve, reject) => {
        client.sendMessage(
            {
                to: YOUR_PHONE,
                from: TWILIO_PHONE,
                body: notification
            },
            function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }
        );
    });
}

module.exports = notifyUserViaText;
