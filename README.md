# order-book-app
Simple application that implements an in-memory order book using a dictionary of queues to keep track of orders at each price point.

To run the application locally, execute `npm install` followed by `node server.js`. The application should start listening at port 3000.

## API

##### GET /api/full-order-book
Returns a list of all buy and sell orders in the order book. Ask orders are sorted by price ascending. Bid orders are sorted by price descending. Orders of the same price are not aggregated.


##### GET /api/aggregated-order-book
Returns a list of all buy and sell orders in the order book. Ask orders are sorted by price ascending. Bid orders are sorted by price descending. Orders of the same price are aggregated.

##### GET /api/market-summary
Returns the current market summary (including the bid and ask).

##### GET /api/order-status/:id
Returns the status of an order that was placed using the provided `id`.

Path variables:

`id`: the order identification number returned by the `/api/orders/limit` endpont.

##### GET /api/recent-trades/:count
Returns (up to) the `count` number of recent trades for the asset in question.

Path variables:

`count`: the maximum number of recent trades to retrieve.

##### POST /api/orders/limit
Create a new limit order.

The JSON body used to create a limit order looks like:
```
{
    "side": "SELL",
    "quantity": "10",
    "price": "1000",
    "postOnly": true,
}
```
Parameters:

`side`: `"BUY"` or `"SELL"`

`quantity`: Units of asset

`price`: Price per unit of asset

`postOnly`: `true` or `false`

Note that the order book requires both `price` and `quantity` to be positive integer values (specified as string literals), and that the maximum price is fixed at `1000000`.
