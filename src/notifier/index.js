require("dotenv").config();
const {
  TWILIO_SID,
  TWILIO_TOKEN,
  TWILIO_PHONE,
  YOUR_PHONE,
  HOME
} = process.env;
const twilio = require("twilio");
const client = twilio(TWILIO_SID, TWILIO_TOKEN);

const twilioActivated = TWILIO_SID && TWILIO_TOKEN && TWILIO_PHONE;

async function notifyUserViaText(notification) {
  if (!twilioActivated) {
    return reject("Twilio is not properly configured");
  }

  const errors = [];

  if (HOME && YOUR_PHONE) {
    sendNotification(notification, YOUR_PHONE);
  } else {
    const { users } = require("../../db/users.json");
    users.map(user => {
      sendNotification(notification, user.phone);
    });
  }
}

function sendNotification(notification, phoneNumber) {
  client.messages.create(
    {
      to: phoneNumber,
      from: TWILIO_PHONE,
      body: notification
    },
    (err, data) => {
      if (err) {
        console.log(new Error(err));
      }
    }
  );
}

module.exports = {
  twilioActivated,
  notifyUserViaText
};
