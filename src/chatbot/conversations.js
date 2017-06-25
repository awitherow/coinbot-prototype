function askForConsent(convo) {
  convo.say("Just a quick introduction...");
  convo.say(
    "My name is Coinbot. I am here to help you keep an eye on cryptocurrency prices."
  );
  convo.say(
    "I will let you know if anything significant opportunities are occurring on the GDAX Exchange."
  );
  convo.say(
    "If you would like to learn more about the GDAX Exchange, check here:"
  );
  convo.say({
    text: "I am going to send you text messages about",
    buttons: [
      {
        type: "postback",
        title: "👍",
        payload: "CONSENT_ACCEPT"
      },
      {
        type: "postback",
        title: "👎",
        payload: "CONSENT_DENY"
      }
    ]
  });
}

function handleConsentDeny(chat) {
  chat.say(
    "Hmm, sorry to hear this. Chat with me any time to change your mind!"
  );
}

function handleConsentAccept(chat) {
  chat.say("Super excited to have you onboard! 😎");
  chat.say(
    "I will let you know if anything significant is going on! Enjoy ! 😎"
  );
}

module.exports = {
  askForConsent,
  handleConsentDeny,
  handleConsentAccept
};
