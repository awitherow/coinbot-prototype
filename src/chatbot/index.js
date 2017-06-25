//@flow
const BootBot = require("bootbot");
const config = require("../config.json");
const bot = new BootBot({
  accessToken: config.facebook.accessToken,
  verifyToken: config.facebook.verifyToken,
  appSecret: config.facebook.appSecret
});

const {
  askForConsent,
  handleConsentDeny,
  handleConsentAccept
} = require("./conversations");

// mock dummy db, need to consider DB solution.
class Users {
  get = () => {};
  set = () => {};
}

// will uncomment later and do in another branch
// class Events {
//     store = event => {};
//     fire = event => {
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

  chat.say(`Hello, ${user.first_name}! 🙂`);

  const store = users.get(sender.id);

  if (store) {
    // Events.fire({
    //     user: { user, id: sender.id },
    //     category: "message",
    //     event: "message from member",
    // });
    // give them options for what a member can do
  } else {
    //user has not registered, ask them to create a unique identifier
    chat.conversation(convo => askForConsent(convo));
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
    case "CONSENT_DENY":
      handleConsentDeny(chat);
      return;
    case "CONSENT_ACCEPT":
      handleConsentAccept(chat);
      Users.set({
        user,
        id: payload.sender.id
      });
      return;
  }
});

bot.start();
