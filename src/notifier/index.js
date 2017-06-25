require("dotenv").config();
const { TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE } = process.env;
const twilio = require("twilio");
const client = twilio(TWILIO_SID, TWILIO_TOKEN);

const { users } = require("../../db/users.json");

const twilioActivated = TWILIO_SID && TWILIO_TOKEN && TWILIO_PHONE;

async function notifyUserViaText(notification) {
  if (!twilioActivated) {
    return reject("Twilio is not properly configured");
  }

  const errors = [];

  users.map(user => {
    client.messages.create(
      {
        to: user.phone,
        from: TWILIO_PHONE,
        body: notification
      },
      (err, data) => {
        if (err) {
          console.log(new Error(err));
        }
      }
    );
  });
}

module.exports = {
  twilioActivated,
  notifyUserViaText
};
