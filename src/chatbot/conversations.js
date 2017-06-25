const {
  COINBOT_RELAX,
  COINBOT_UPGRADE,
  COINBOT_FEEDBACK,
  CONSENT_ACCEPT,
  CONSENT_DENY
} = require("./constants");

function askForConsent(chat) {
  chat.say("I don't think we have met before!");
  chat.say(
    "My name is Coinbot 🤖 I am here to help you keep an eye on cryptocurrency prices."
  );
  chat.say(
    "I will let you know if the market is like 📈 or like 📉 according to the GDAX exchange."
  );
  chat.say({
    text: "Do you want to me to keep you up to date via Messenger?",
    buttons: [
      {
        type: "postback",
        title: "👍",
        payload: CONSENT_ACCEPT
      },
      {
        type: "postback",
        title: "👎",
        payload: CONSENT_DENY
      }
    ]
  });
}

function handleConsentDeny(chat) {
  chat.say(
    "Hmm, sorry to hear this. Chat with me any time to change your mind! 👋"
  );
}

function handleConsentAccept(chat) {
  chat.say("Super excited to have you onboard! 😎");
  chat.say("I will let you know of significant coin moovement! Enjoy!");
  chat.say(
    "If you need help anytime, just type 'help', or 'info' if you want to learn about me."
  );
  chat.say(
    "Last thing... If you think I do a good job, you can learn how to support my growth by typing 'premium' ❤️ "
  );
  chat.say("Hope to hear from you soon! 🙇");
}

function offerBasicHelp(chat) {
  chat.say(
    "Type 'help' if you need something specific or 'info' for more info."
  );
  chat.say({
    text: "Or pick the options below:",
    buttons: [
      {
        type: "postback",
        title: "Take a break",
        payload: COINBOT_RELAX
      },
      {
        type: "postback",
        title: "Give feedback",
        payload: COINBOT_FEEDBACK
      },
      {
        type: "postback",
        title: "Go Premium",
        payload: COINBOT_UPGRADE
      }
    ]
  });
}

module.exports = {
  askForConsent,
  handleConsentDeny,
  handleConsentAccept
};
