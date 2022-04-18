const date = require("date-and-time");
const Denque = require("denque");
const {v4: uuid4} = require("uuid");

const LimitOrder = require("./limit_order");
const Status = require("./status");
const Trade = require("./trade");
const utils = require("./utils");


class OrderBook {
  #pricePoints;
  #limitOrders;
  #ask; #bid;
  #trades;
  #statusRegistry;

  constructor(pricePoints) {
    if (!Number.isInteger(pricePoints) || pricePoints < 1) {
      throw new Error(`pricePoints (${pricePoints}) must be at least 1`);
    };

    this.#pricePoints = pricePoints;
    // Dictionary of queues: for each legal price, an empty queue is created
    this.#limitOrders = [...Array(pricePoints).keys()].reduce((result, currentValue) => {
      result[currentValue + 1] = new Denque();
      return result
    }, {});
    this.#ask = null; this.#bid = null;
    this.#trades = [];
    this.#statusRegistry = {};
  }

  get ask() { return this.#ask; }

  get bid() { return this.#bid; }

  get trades() { return this.#trades; }

  get fullOrderBook() {
    const fullOrderBook = {Asks: [], Bids: []};
    if (this.#ask !== null) {
      for (let price = this.#ask; price <= this.#pricePoints; price++) {
        fullOrderBook.Asks.push(
          ...utils.parseLimitOrders(this.#limitOrders[price].toArray(), "SELL")
        );
      };
    };
    if (this.#bid !== null) {
      for (let price = this.#bid; price >= 1; price--) {
        fullOrderBook.Bids.push(
          ...utils.parseLimitOrders(this.#limitOrders[price].toArray(), "BUY")
        );
      };
    };
    return fullOrderBook;
  }

  get aggregatedOrderBook() {
    return {
      Asks: utils.parseParsedLimitOrdersToAggregated(this.fullOrderBook.Asks, false),
      Bids: utils.parseParsedLimitOrdersToAggregated(this.fullOrderBook.Bids, true)
    };
  }

  get marketSummary() {
    const lastTrade = this.#trades[this.#trades.length - 1]
    const limitOrdersAtAsk = this.#limitOrders[this.#ask];
    const limitOrdersAtBid = this.#limitOrders[this.#bid];

    return {
      "ask": this.#ask,
      "bid": this.#bid,
      "lastTradedPrice": lastTrade ? lastTrade.price : null,
      "lastTradeTime": lastTrade ? date.format(lastTrade.dateCreated, "YYYY/MM/DD HH:mm:SSS") : null,
      "askVolume": limitOrdersAtAsk ? limitOrdersAtAsk.toArray().reduce((result, currentValue) => result + currentValue.quantity, 0) : null,
      "bidVolume": limitOrdersAtBid ? limitOrdersAtBid.toArray().reduce((result, currentValue) => result + currentValue.quantity, 0) : null
    };
  }

  getStatus(id) {
    if (!this.#statusRegistry.hasOwnProperty(id)) {
      throw new Error(`no record found for provided id (${id})`);
    };
    return utils.parseOrderStatus(this.#statusRegistry[id]);
  }

  getRecentTradeHistory(count) {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error(`count (${count}) must be a positive integer`);
    };
    return utils.parseTrades(this.#trades.slice(-count));
  }

  attemptLimitOrder(side, price, quantity, postOnly) {
    if (side !== "BUY" && side !== "SELL") {
      throw new Error(`side (${side}) must either be BUY or SELL`);
    };
    if (!Number.isInteger(price) || price < 1) {
      throw new Error(`price (${price}) must be a positive integer`);
    };
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`quantity (${quantity}) must be a positive integer`);
    };

    const id = uuid4(); const dateCreated = new Date();
    this.#statusRegistry[id] = new Status(
      side, price, postOnly, quantity, id, dateCreated
    );

    if (price > this.#pricePoints) {
      this.#statusRegistry[id].cancelOrder(dateCreated, "Invalid price");
      return id;
    };

    if (side === "BUY") {
      // Cancel postOnly orders that match at least partially
      if (this.#ask !== null && price >= this.#ask && postOnly === true) {
        this.#statusRegistry[id].cancelOrder(dateCreated, "Post-only matched at least partially");
        return id;
      };

      // No existing sell orders to match against, thus add to order book
      if (this.#ask === null) {
        this.#placeLimitOrder(side, price, quantity, postOnly, id, dateCreated);
        return id
      };

      // Match as much of order possible
      while (this.#ask !== null && price >= this.#ask) {
        quantity = this.#trade(side, this.#ask, quantity, id, dateCreated);
        this.#ask = this.#getNearestPriceWithVolume(this.#ask, 1);
        if (quantity === 0) return id;
      };

      // Some remaining quantity needs to be added to order book
      this.#placeLimitOrder(side, price, quantity, postOnly, id, dateCreated);
      return id;
    } else if (side === "SELL") {
      // Cancel postOnly orders that match at least partially
      if (this.#bid !== null && price <= this.#bid && postOnly === true) {
          this.#statusRegistry[id].cancelOrder(dateCreated, "Post-only matched at least partially");
        return id;
      };

      // No existing buy orders to match against, thus add to order book
      if (this.#bid === null) {
        this.#placeLimitOrder(side, price, quantity, postOnly, id, dateCreated);
        return id;
      };

      // Match as much of order possible
      while (this.#bid !== null && price <= this.#bid) {
        quantity = this.#trade(side, this.#bid, quantity, id, dateCreated);
        this.#bid = this.#getNearestPriceWithVolume(this.#bid, -1);
        if (quantity === 0) return id;
      };

      // Some remaining quantity needs to be added to order book
      this.#placeLimitOrder(side, price, quantity, postOnly, id, dateCreated);
      return id;
    };
  };

  #trade(side, price, quantity, id, dateCreated) {
    const order = this.#limitOrders[price].peekFront();
    if (quantity >= order.quantity) {
      this.#trades.push(new Trade(price, order.quantity, side, dateCreated));
      this.#statusRegistry[order.id].fillExistingOrder(dateCreated, order.quantity);
      this.#statusRegistry[id].fillNewOrder(dateCreated, order.quantity);
      quantity -= order.quantity;
      this.#limitOrders[price].shift();
    } else {
      this.#trades.push(new Trade(price, quantity, side, dateCreated));
      this.#statusRegistry[order.id].fillExistingOrder(dateCreated, quantity);
      this.#statusRegistry[id].fillNewOrder(dateCreated, quantity);
      order.quantity -= quantity;
      quantity = 0;
    };
    return quantity;
  }

  #placeLimitOrder(side, price, quantity, postOnly, id, dateCreated) {
    if (side === "BUY") {
      if (this.#bid === null || price > this.#bid) this.#bid = price;
    } else if (side === "SELL") {
      if (this.#ask === null || price < this.#ask) this.#ask = price;
    };

    this.#limitOrders[price].push(new LimitOrder(price, quantity, id, dateCreated));
    this.#statusRegistry[id].setOrderStatusToPlaced(dateCreated);
  }

  #getNearestPriceWithVolume(price, increment) {
    if (price < 1 || price > this.#pricePoints) return null;
    if (this.#limitOrders[price].length > 0) return price;
    return this.#getNearestPriceWithVolume(price + increment, increment);
  }
}

module.exports = OrderBook;
