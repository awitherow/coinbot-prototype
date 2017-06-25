const BootBot = require("bootbot");
const config = require("../config.json");
const bot = new BootBot({
  accessToken: config.facebook.access_token,
  verifyToken: config.facebook.verify_token,
  appSecret: config.facebook.app_secret
});

const {
  askForConsent,
  handleConsentDeny,
  handleConsentAccept,
  offerBasicHelp
} = require("./conversations");

const {
  CONSENT_DENY,
  CONSENT_ACCEPT,
  COINBOT_RELAX,
  COINBOT_FEEDBACK,
  COINBOT_UPGRADE
} = require("./constants");

// mock dummy db, need to consider DB solution.
class Users {
  get() {}
  create() {}
}

// will uncomment later and do in another branch
// class Events {
//     store(event) {};
//     fire(event) {
//         this.store({
//             ...event,
//             timestamp: new Date.now(),
//         });
//     };
// }

// message handler
bot.on("message", async (payload, chat) => {
  const { message, sender } = payload;
  const { user } = await chat.getUserProfile();

  chat.say(`Hello, ${user.first_name}!`);

  const store = Users.get(sender.id);

  if (store) {
    // Events.fire({
    //     user: { user, id: sender.id },
    //     category: "message",
    //     event: "message from member",
    // });

    chat.say("Good to hear from you again. 😌");
    // offer basic help
    // check store id, if premium (paying), offer settings
    offerBasicHelp(chat);
  } else {
    // user has not registered, ask them to create a unique identifier
    askForConsent(chat);
  }
});

// postback handler
bot.on("postback", async (payload, chat) => {
  const { user } = await chat.getUserProfile();
  // Events.fire({
  //     user: { user, id: sender.id },
  //     category: "message",
  //     event: "message from member",
  // });

  switch (payload) {
    case CONSENT_DENY:
      handleConsentDeny(chat);
      return;
    case CONSENT_ACCEPT:
      handleConsentAccept(chat);
      Users.create({
        id: payload.sender.id
      });
      return;
    case COINBOT_UPGRADE:
      chat.say("Upgrade coming soon...");
      // payment conversation
      // update user as paying
      return;
    case COINBOT_RELAX:
      chat.say("Relax coming soon...");
      // update user to not get notified
      // 1 hour, 1 day, 1 week, custom
      return;
    case COINBOT_FEEDBACK:
      chat.say("Feedback coming soon...");
      // accept feedback message
      // offer a smiley face system
      // plus text
      return;
  }
});

bot.hear(["info"], (payload, chat) => {
  chat.say("more info coming soon...");
});
bot.hear(["premium"], (payload, chat) => {
  chat.say("premium coming soon...");
});
bot.hear(["help"], (payload, chat) => {
  chat.say("help coming soon...");
});

bot.start();
