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

there are 4 required environment variables that are used in the application:

```
KEY
SECRET
PASS
ENDPOINT
```

These are used to connect to the authenticated client, to get account related stuff.

To get the key, secret, pass you will need to create a key via gdax > settings > api.

We are only using view permissions for this app at the moment.

You need to save these somewhere secure. If you lose them, you will need to generate new ones.

When you have these, simply set the items in your .env, example:

```
KEY=3469038hae4ha0e9h3
SECRET=aeprhajerh09ua34zahe
PASS=ah049ja4ha0fh09a34jh
ENDPOINT=https://api.gdax.com
```
## scripts

`yarn dev`

This will use nodemon to watch for changes and restart the server with each file save. Be mindful, as it watches EVERY FILE FOR CHANGE. 

## todo

- add flow type checking
- add eslint
- json storage

## technology 

- https://github.com/coinbase/gdax-node
- https://docs.gdax.com/
- https://core.telegram.org/bots/api

## algorithm ideas

bot runs.
- get humans last purchase.
- get last day of bitcoin movement.
    - get furthest absolute point,
    - get distance between execution time and furthest abs point
    - get direction the trend is moving,
    - get velocity at which the trend is moving,
    - decision (trend, velocity and distance)
        - if budget/no bitcoin
            - if (current - last value >= 50) && `check to see if market is going up`
                - is increasing sharply
                    - check two days ago bitcoin movement
                        - if velocity is same or increasing(upsoar)
                            - wait 3 hours.
                            - send text about upsoar.
                - is increasing slowly
                    - wait 1 hours
                    - send potential upper peak.
                - if flatlining
                    - send text to sell
                    - potentially automate sale
                        - increase budget. 
            - if (current - last >= -25) && `check to insure market is going down`
                - send text that we could have bought later.
        - if bitcoin/no budget
            - if (current - last >= -25) && `check to insure market is going down`
                - is decreasing sharply
                    - check two days ago
                        - if velocity is same or increasing(downward dive), wait 6 hours.
                - is decreasing slowly
                    - wait 1 hours
                    - send potential bottom peak.
                - if flatlining
                    - send text to buy 
                    - check again in 30 minutes
                    - potentially automate purchase
                        - increase budget.
            - if (current - last value >= 50) && `check to see if market is going up`
                - send text that we could have sold later.
        - if no money
            - use pretend budget of [1000, 2500, 5000, 1000] and run same algorithms as above
            - record the earning reality potentials and track 