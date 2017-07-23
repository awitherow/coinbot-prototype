[![wercker status](https://app.wercker.com/status/94a2cb8221a6667b8e8c0ccac3eb01e1/s/master "wercker status")](https://app.wercker.com/project/byKey/94a2cb8221a6667b8e8c0ccac3eb01e1)

# coinbot
a simple long term investment assistant tool using the GDAX exchange API and Twilio for notifications.

## features

* text you when the 24 hour price is down 20%+
* text you when the 24 hour price is up 20%+ 

## development

### requirements

- [node](https://nodejs.org/en/) - v8.0.0 min

#### optional

- [nvm](https://github.com/creationix/nvm/blob/master/README.markdown#installation) node version manager to ensure you are on the right version of node. uses the projects `.nvmrc`.

### setting up

```
git clone https://github.com/awitherow/coinbot
cd coinbot
cp -i .envexample .env
npm install
npm run dev
```

#### .env

there are 5 required environment variables that are used in the application:

```
KEY
SECRET
PASS
ENDPOINT
CURRENCY
```

These are used to connect to the authenticated client, to get account related stuff.

To get the key, secret, pass you will need to create a key via gdax > settings > api.

We are only using view permissions for this app at the moment.

You need to save these somewhere secure. If you lose them, you will need to generate new ones.

Currency can be of type `USD`, `EUR`, `GBP`, or `BTC`.

When you have these, simply set the items in your .env, example:

```
KEY=3469038hae4ha0e9h3
SECRET=aeprhajerh09ua34zahe
PASS=ah049ja4ha0fh09a34jh
ENDPOINT=https://api.gdax.com
CURRENCY=USD
HOME=true
```

The `HOME` variable is important if you wish you run it at your own home, or on your personal computer. Throughout the application there are areas where a production facing environment is under development, and these features will only work through interaction with "databases" in the `db` folder.

If you would like to become a fulltime maintainer/admin of coinbot, please chat with me (Austin) and we can discuss the move, and set up proper authorization to accessing this environment.

#### optional

Twilio is integrated so you can send yourself text messages.

YOU will need to modify your `.env` to include the following:

```
TWILIO_SID=
TWILIO_TOKEN=
YOUR_PHONE=
TWILIO_PHONE=
```

## scripts

`npm run dev`

This will use nodemon to watch for changes and restart the server with each file save. Be mindful, as it watches EVERY FILE FOR CHANGE. 

`npm run home` 

This will run the production environment on your local machine, using your environment variables versus the users.json database.

## dependencies 

- https://github.com/coinbase/gdax-node
