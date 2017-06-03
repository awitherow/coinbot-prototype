require('dotenv').config();
const { TWILIO_SID, TWILIO_TOKEN, YOUR_PHONE, TWILIO_PHONE } = process.env;
const twilio = require('twilio');
const client = twilio(TWILIO_SID, TWILIO_TOKEN);

const twilioActivated =
    TWILIO_SID && TWILIO_TOKEN && TWILIO_PHONE && YOUR_PHONE;

function notifyUserViaText(notification) {
    return new Promise((resolve, reject) => {
        if (!twilioActivated) {
            return reject('You need to have twilio activated to get this far');
        }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        client.messages.create(
            {
                to: YOUR_PHONE,
                from: TWILIO_PHONE,
                body: notification,
            },
            (err, data) => {
                if (err) {
                    return reject(new Error(err));
                } else {
                    return resolve(data);
                }
            }
        );
    });
}

module.exports = {
    twilioActivated,
    notifyUserViaText,
};
