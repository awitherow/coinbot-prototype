# coinbot
coin trading assistant bot

## technology 

- https://docs.gdax.com/
- twilio, or slack bot or any other chat platform. ideally private, thus text.

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