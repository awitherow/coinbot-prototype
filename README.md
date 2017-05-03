# coinbot
coin trading assistant bot

## development

### requirements

- [node](https://nodejs.org/en/) - v7.8.0 min
- [yarn](https://code.facebook.com/posts/1840075619545360)

#### optional

- [nvm](https://github.com/creationix/nvm/blob/master/README.markdown#installation) node version manager to ensure you are on the right version of node. uses the projects `.nvmrc`.

### setting up

```
git clone https://github.com/awitherow/coinbot
cd coinbot
cp -i .envexample .env
yarn
yarn dev
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
`
Currency can be of type `USD`, `EUR`, `GBP`, or `BTC`.

When you have these, simply set the items in your .env, example:

```
KEY=3469038hae4ha0e9h3
SECRET=aeprhajerh09ua34zahe
PASS=ah049ja4ha0fh09a34jh
ENDPOINT=https://api.gdax.com
CURRENCY=USD
```

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

`yarn dev`

This will use nodemon to watch for changes and restart the server with each file save. Be mindful, as it watches EVERY FILE FOR CHANGE. 

## todo

- [x] sell recommendations
- [x] telegram hookup
- [] ensure proper data is there before performing functions (gdax-node fail)
- [] prettier chalkification
- [] shell configuration script to set risk/frequency of trading wishes
- [] json storage
- [] mutli coin integration
- [] comparing potential profits on multicoin

## technology 

- https://github.com/coinbase/gdax-node