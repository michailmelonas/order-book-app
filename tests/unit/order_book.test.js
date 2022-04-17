const OrderBook = require("../../order_book/order_book");

describe("order_book.OrderBook.constructor", () => {
  it("should throw an error with pricePoints less than 1", () => {
    expect(() => new OrderBook(0)).toThrow();
  });

  it("should throw an error with pricePoints not an integer", () => {
    expect(() => new OrderBook(1.1));
  });

  it("should create an OrderBook intance", () => {
    const orderBook = new OrderBook(5);

    expect(orderBook).toBeInstanceOf(OrderBook);
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBeNull();
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);
  });
});

describe("order_book.OrderBook.fullOrderBook", () => {
  it("should ensure that full order book in the expected form", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 3, 1, false);

    expect(orderBook.fullOrderBook.Bids.length).toBe(1);
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids[0]).toMatchObject({
      price: 2, quantity: 1, positionAtPrice: 1, side: "BUY"
    });
    expect(orderBook.fullOrderBook.Asks[0]).toMatchObject({
      price: 3, quantity: 1, positionAtPrice: 1, side: "SELL"
    });
  });

  it("should ensure that asks are ascending and bids are descending", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 1, 1, false);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 4, 1, false);
    orderBook.attemptLimitOrder("SELL", 5, 1, false);

    expect(orderBook.fullOrderBook.Asks.length).toBe(2);
    expect(orderBook.fullOrderBook.Bids.length).toBe(2);
    expect(orderBook.fullOrderBook.Asks[0].price).toBe(4);
    expect(orderBook.fullOrderBook.Asks[1].price).toBe(5);
    expect(orderBook.fullOrderBook.Bids[0].price).toBe(2);
    expect(orderBook.fullOrderBook.Bids[1].price).toBe(1);
  });

  it("should ensure that position at price updates as additional orders placed", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 3, 1, false);
    orderBook.attemptLimitOrder("BUY", 3, 2, false);
    orderBook.attemptLimitOrder("SELL", 4, 1, false);
    orderBook.attemptLimitOrder("SELL", 4, 2, false);

    expect(orderBook.fullOrderBook.Bids.length).toBe(2);
    expect(orderBook.fullOrderBook.Bids[0]).toMatchObject({quantity: 1, positionAtPrice: 1});
    expect(orderBook.fullOrderBook.Bids[1]).toMatchObject({quantity: 2, positionAtPrice: 2});
    expect(orderBook.fullOrderBook.Asks.length).toBe(2);
    expect(orderBook.fullOrderBook.Asks[0]).toMatchObject({quantity: 1, positionAtPrice: 1});
    expect(orderBook.fullOrderBook.Asks[1]).toMatchObject({quantity: 2, positionAtPrice: 2});
  });
});

describe("order_book.OrderBook.aggregatedOrderBook", () => {
  it("should ensure that aggregated order book in the expected form", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 4, 1, false);

    expect(orderBook.aggregatedOrderBook.Bids.length).toBe(1);
    expect(orderBook.aggregatedOrderBook.Asks.length).toBe(1);
    expect(orderBook.aggregatedOrderBook.Bids[0]).toMatchObject({
      price: 2, quantity: 1, side: "BUY", orderCount: 1
    });
    expect(orderBook.aggregatedOrderBook.Asks[0]).toMatchObject({
      price: 4, quantity: 1, side: "SELL", orderCount: 1
    });
  });

  it("should ensure that asks are ascending and bids are descending", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 1, 1, false);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 3, 1, false);
    orderBook.attemptLimitOrder("SELL", 4, 1, false);

    expect(orderBook.aggregatedOrderBook.Asks.length).toBe(2);
    expect(orderBook.aggregatedOrderBook.Bids.length).toBe(2);
    expect(orderBook.aggregatedOrderBook.Asks[0].price).toBe(3);
    expect(orderBook.aggregatedOrderBook.Asks[1].price).toBe(4);
    expect(orderBook.aggregatedOrderBook.Bids[0].price).toBe(2);
    expect(orderBook.aggregatedOrderBook.Bids[1].price).toBe(1);
  });

  it("should ensure that order count updates as additional orders placed", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("BUY", 3, 1, false);
    orderBook.attemptLimitOrder("SELL", 4, 1, false);
    orderBook.attemptLimitOrder("SELL", 4, 1, false);
    orderBook.attemptLimitOrder("SELL", 5, 1, false);

    expect(orderBook.aggregatedOrderBook.Asks.length).toBe(2);
    expect(orderBook.aggregatedOrderBook.Bids.length).toBe(2);
    expect(orderBook.aggregatedOrderBook.Asks[0]).toMatchObject({
      price: 4, quantity: 2, side: "SELL", orderCount: 2
    });
    expect(orderBook.aggregatedOrderBook.Asks[1]).toMatchObject({
      price: 5, quantity: 1, side: "SELL", orderCount: 1
    });
    expect(orderBook.aggregatedOrderBook.Bids[0]).toMatchObject({
      price: 3, quantity: 1, side: "BUY", orderCount: 1
    });
    expect(orderBook.aggregatedOrderBook.Bids[1]).toMatchObject({
      price: 2, quantity: 2, side: "BUY", orderCount: 2
    });
  });
});

describe("order_book.OrderBook.marketSummary", () => {
  it("should return summary when no trades made and no live orders", () => {
    const orderBook = new OrderBook(5);

    expect(orderBook.marketSummary.ask).toBeNull();
    expect(orderBook.marketSummary.bid).toBeNull();
    expect(orderBook.marketSummary.lastTradedPrice).toBeNull();
    expect(orderBook.marketSummary.lastTradeTime).toBeNull();
    expect(orderBook.marketSummary.askVolume).toBeNull();
    expect(orderBook.marketSummary.bidVolume).toBeNull();
  });

  it("should return summary when no trades and with live orders", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 3, 1, false);

    expect(orderBook.marketSummary.ask).toBe(3);
    expect(orderBook.marketSummary.bid).toBe(2);
    expect(orderBook.marketSummary.lastTradedPrice).toBeNull();
    expect(orderBook.marketSummary.lastTradeTime).toBeNull();
    expect(orderBook.marketSummary.askVolume).toBe(1);
    expect(orderBook.marketSummary.bidVolume).toBe(1);
  });

  it("should return summary when trades have been made and with live orders", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 2, 2, false);
    orderBook.attemptLimitOrder("SELL", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 3, 1, false);

    expect(orderBook.marketSummary.ask).toBe(3);
    expect(orderBook.marketSummary.bid).toBe(2);
    expect(orderBook.marketSummary.lastTradedPrice).toBe(2);
    expect(orderBook.marketSummary.lastTradeTime).toBeTruthy();
    expect(orderBook.marketSummary.askVolume).toBe(1);
    expect(orderBook.marketSummary.bidVolume).toBe(1);
  });
});

describe("order_book.OrderBook.getStatus", () => {
  it("should throw an error for invalid order id", () => {
    const orderBook = new OrderBook(5);
    expect(() => orderBook.getStatus("abc123")).toThrow();
  });

  it("should return order status set to placed with partial quantity filled", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 3, 1, false);
    const id = orderBook.attemptLimitOrder("SELL", 3, 2, false);
    const status = orderBook.getStatus(id);

    expect(status.side).toBe("SELL");
    expect(status.price).toBe(3);
    expect(status.postOnly).toBe(false);
    expect(status.originalQuantity).toBe(2);
    expect(status.id).toBe(id);
    expect(status.dateCreated).toBeTruthy();
    expect(status.dateLastUpdated).toBeTruthy();
    expect(status.remainingQuantity).toBe(1);
    expect(status.status).toBe("Placed");
    expect(status.cancelReason).toBeNull();
  });
});

describe("order_book.OrderBook.getTradeHistory", () => {
  it("should throw an error with count not an integer", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.getTradeHistory(1.1)).toThrow();
  });

  it("should throw an error with count less than 1", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.getTradeHistory(0)).toThrow();
  });

  it("should return empty trade history when no trades have taken place", () => {
    const orderBook = new OrderBook(5);
    const tradeHistory = orderBook.getTradeHistory(1);

    expect(tradeHistory.length).toBe(0);
  });

  it("should return trade history", () => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("BUY", 2, 1, false);
    orderBook.attemptLimitOrder("SELL", 2, 1, false);

    orderBook.attemptLimitOrder("SELL", 3, 5, false);
    orderBook.attemptLimitOrder("BUY", 3, 4, false);

    const tradeHistory = orderBook.getTradeHistory(2);

    expect(tradeHistory.length).toBe(2);
    expect(tradeHistory[0].price).toBe(3);
    expect(tradeHistory[0].quantity).toBe(4);
    expect(tradeHistory[0].takerSide).toBe("BUY");
    expect(tradeHistory[1].price).toBe(2);
    expect(tradeHistory[1].quantity).toBe(1);
    expect(tradeHistory[1].takerSide).toBe("SELL");
  });
});

describe("order_book.OrderBook.attemptLimitOrder", () => {
  it("should throw an error when side is not equal to BUY or SELL", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.attemptLimitOrder("ABC", 1, 1, false)).toThrow();
  });

  it("should throw an error when price is not an integer", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.attemptLimitOrder("BUY", 1.1, 1, false)).toThrow();
  });

  it("should throw an error when price is less than 1", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.attemptLimitOrder("BUY", 0, 1, false)).toThrow();
  });

  it("should throw an error when quantity is not an integer", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.attemptLimitOrder("BUY", 1, 1.1, false)).toThrow();
  });

  it("should throw an error when quantity is less than 1", () => {
    const orderBook = new OrderBook(5);

    expect(() => orderBook.attemptLimitOrder("BUY", 1, 0, false)).toThrow();
  });

  it.each([["BUY", false], ["BUY", true], ["SELL", false], ["SELL", true]])(
    "should cancel order placed with invalid price",
    (side, postOnly) => {
      const orderBook = new OrderBook(5);
      const id = orderBook.attemptLimitOrder(side, 6, 1, postOnly);

      expect(id).toBeTruthy();
      expect(orderBook.ask).toBeNull();
      expect(orderBook.bid).toBeNull();
      expect(orderBook.fullOrderBook.Asks.length).toBe(0);
      expect(orderBook.fullOrderBook.Bids.length).toBe(0);
      expect(orderBook.getStatus(id).status).toBe("Cancelled");
      expect(orderBook.marketSummary.lastTradedPrice).toBeNull();
    }
  );

  it.each([false, true])("should place single buy order", postOnly => {
    const orderBook = new OrderBook(5);
    const id = orderBook.attemptLimitOrder("BUY", 3, 1, true);

    expect(id).toBeTruthy();
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBe(3);
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(1);
    expect(orderBook.getStatus(id).status).toBe("Placed");
  });

  it.each([false, true])("should place single sell order", postOnly => {
    const orderBook = new OrderBook(5);
    const id = orderBook.attemptLimitOrder("SELL", 3, 1, true);

    expect(id).toBeTruthy();
    expect(orderBook.ask).toBe(3);
    expect(orderBook.bid).toBeNull();
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);
    expect(orderBook.getStatus(id).status).toBe("Placed");
  });

  it.each([1, 2])("should cancel at least partially matched post-only order", quantity => {
    const orderBook = new OrderBook(5);
    orderBook.attemptLimitOrder("SELL", 3, 2, false);
    const id = orderBook.attemptLimitOrder("BUY", 3, quantity, true);

    expect(id).toBeTruthy();
    expect(orderBook.ask).toBe(3);
    expect(orderBook.bid).toBeNull();
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);
    expect(orderBook.getStatus(id).status).toBe("Cancelled");
  });

  it("should match buy order fully against single sell order with sell order partially matched", () => {
    const orderBook = new OrderBook(5);
    const sellOrderId = orderBook.attemptLimitOrder("SELL", 3, 2, false);
    const buyOrderId = orderBook.attemptLimitOrder("BUY", 3, 1, false);

    expect(sellOrderId).toBeTruthy();
    expect(buyOrderId).toBeTruthy();
    expect(orderBook.ask).toBe(3);
    expect(orderBook.bid).toBeNull();
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);
    expect(orderBook.getStatus(sellOrderId).status).toBe("Placed");
    expect(orderBook.getStatus(buyOrderId).status).toBe("Completed");
    expect(orderBook.trades.length).toBe(1);
    expect(orderBook.trades[0].price).toBe(3);
    expect(orderBook.trades[0].takerSide).toBe("BUY");
  });

  it("should match buy order fully against single sell order with sell order fully matched", () => {
    const orderBook = new OrderBook(5);
    const sellOrderId = orderBook.attemptLimitOrder("SELL", 3, 2, false);
    const buyOrderId = orderBook.attemptLimitOrder("BUY", 3, 2, false);

    expect(sellOrderId).toBeTruthy();
    expect(buyOrderId).toBeTruthy();
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBeNull();
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);
    expect(orderBook.getStatus(sellOrderId).status).toBe("Completed");
    expect(orderBook.getStatus(buyOrderId).status).toBe("Completed");
    expect(orderBook.trades.length).toBe(1);
    expect(orderBook.trades[0].price).toBe(3);
    expect(orderBook.trades[0].takerSide).toBe("BUY");
  });

  it("should match sell order fully against single buy order with buy order partially matched", () => {
    const orderBook = new OrderBook(5);
    const buyOrderId = orderBook.attemptLimitOrder("BUY", 3, 2, false);
    const sellOrderId = orderBook.attemptLimitOrder("SELL", 3, 1, false);

    expect(buyOrderId).toBeTruthy();
    expect(sellOrderId).toBeTruthy();
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBe(3);
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(1);
    expect(orderBook.getStatus(buyOrderId).status).toBe("Placed");
    expect(orderBook.getStatus(sellOrderId).status).toBe("Completed");
    expect(orderBook.trades.length).toBe(1);
    expect(orderBook.trades[0].price).toBe(3);
    expect(orderBook.trades[0].takerSide).toBe("SELL");
  });

  it("should match sell order fully against single buy order with buy order fully matched", () => {
    const orderBook = new OrderBook(5);
    const buyOrderId = orderBook.attemptLimitOrder("BUY", 3, 2, false);
    const sellOrderId = orderBook.attemptLimitOrder("SELL", 3, 2, false);

    expect(buyOrderId).toBeTruthy();
    expect(sellOrderId).toBeTruthy();
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBeNull();
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);
    expect(orderBook.getStatus(buyOrderId).status).toBe("Completed");
    expect(orderBook.getStatus(sellOrderId).status).toBe("Completed");
    expect(orderBook.trades.length).toBe(1);
    expect(orderBook.trades[0].price).toBe(3);
    expect(orderBook.trades[0].takerSide).toBe("SELL");
  });

  it("should match buy order against multiple sell orders", () => {
    const orderBook = new OrderBook(1000);
    orderBook.attemptLimitOrder("SELL", 101, 1, false);
    for (let i = 50; i < 100; i++) {
      orderBook.attemptLimitOrder("SELL", i, 1, false);
    };
    const id = orderBook.attemptLimitOrder("BUY", 100, 100, false);

    expect(id).toBeTruthy();
    expect(orderBook.ask).toBe(101);
    expect(orderBook.bid).toBe(100);
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(1);
    expect(orderBook.trades.length).toBe(50);
    expect(orderBook.trades[0].price).toBe(50);
    expect(orderBook.trades[49].price).toBe(99);
  });

  it("should match sell order against multiple buy orders", () => {
    const orderBook = new OrderBook(1000);
    orderBook.attemptLimitOrder("BUY", 1, 1, false);
    for (let i = 51; i > 1; i--) {
      orderBook.attemptLimitOrder("BUY", i, 1, false);
    };
    const id = orderBook.attemptLimitOrder("SELL", 2, 100, false);

    expect(id).toBeTruthy();
    expect(orderBook.ask).toBe(2);
    expect(orderBook.bid).toBe(1);
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(1);
    expect(orderBook.trades.length).toBe(50);
    expect(orderBook.trades[0].price).toBe(51);
    expect(orderBook.trades[49].price).toBe(2);
  });

  it("should create large order book in equilibrium state", () => {
    const orderBook = new OrderBook(1000);
    for (let i = 50; i > 0; i--) {
      orderBook.attemptLimitOrder("BUY", i, 1, false);
    };
    for (let i = 51; i < 101; i++) {
      orderBook.attemptLimitOrder("SELL", i, 1, false);
    };
    const buyOrderId = orderBook.attemptLimitOrder("BUY", 50, 10, false);
    const sellOrderId = orderBook.attemptLimitOrder("SELL", 51, 10, false);

    expect(buyOrderId).toBeTruthy();
    expect(sellOrderId).toBeTruthy();
    expect(orderBook.getStatus(buyOrderId).status).toBe("Placed");
    expect(orderBook.getStatus(sellOrderId).status).toBe("Placed");
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.fullOrderBook.Asks.length).toBe(51);
    expect(orderBook.fullOrderBook.Bids.length).toBe(51);
    expect(orderBook.fullOrderBook.Asks[0].price).toBe(51);
    expect(orderBook.fullOrderBook.Asks[0].positionAtPrice).toBe(1)
    expect(orderBook.fullOrderBook.Asks[0].side).toBe("SELL");
    expect(orderBook.fullOrderBook.Asks[1].price).toBe(51);
    expect(orderBook.fullOrderBook.Asks[1].positionAtPrice).toBe(2)
    expect(orderBook.fullOrderBook.Asks[1].side).toBe("SELL");
    expect(orderBook.fullOrderBook.Asks[2].price).toBe(52);
    expect(orderBook.fullOrderBook.Asks[2].positionAtPrice).toBe(1)
    expect(orderBook.fullOrderBook.Asks[2].side).toBe("SELL");
    expect(orderBook.fullOrderBook.Bids[0].price).toBe(50);
    expect(orderBook.fullOrderBook.Bids[0].positionAtPrice).toBe(1)
    expect(orderBook.fullOrderBook.Bids[0].side).toBe("BUY");
    expect(orderBook.fullOrderBook.Bids[1].price).toBe(50);
    expect(orderBook.fullOrderBook.Bids[1].positionAtPrice).toBe(2)
    expect(orderBook.fullOrderBook.Bids[1].side).toBe("BUY");
    expect(orderBook.fullOrderBook.Bids[2].price).toBe(49);
    expect(orderBook.fullOrderBook.Bids[2].positionAtPrice).toBe(1)
    expect(orderBook.fullOrderBook.Bids[2].side).toBe("BUY");
    expect(orderBook.trades.length).toBe(0);
  });

  it("should simulate typical trading scenario", () => {
    const orderBook = new OrderBook(100);

    // Empty order book
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBeNull();
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(0);

    // Place first buy order
    orderBook.attemptLimitOrder("BUY", 49, 10, false);
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBe(49);
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(1);

    // Place second buy order below bid
    orderBook.attemptLimitOrder("BUY", 48, 10, false);
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBe(49);
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(2);

    // Place third buy order above bid
    orderBook.attemptLimitOrder("BUY", 50, 10, false);
    expect(orderBook.ask).toBeNull();
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(0);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Place first sell order above bid
    orderBook.attemptLimitOrder("SELL", 52, 20, false);
    expect(orderBook.ask).toBe(52);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Place second sell order above ask
    orderBook.attemptLimitOrder("SELL", 53, 20, false);
    expect(orderBook.ask).toBe(52);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(2);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Place third sell order below ask
    orderBook.attemptLimitOrder("SELL", 51, 20, false);
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(0);
    expect(orderBook.fullOrderBook.Asks.length).toBe(3);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Fully matched buy order at ask
    orderBook.attemptLimitOrder("BUY", 51, 1, false);
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(1);
    expect(orderBook.trades[0].price).toBe(51);
    expect(orderBook.fullOrderBook.Asks.length).toBe(3);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Fully matched buy order above ask
    orderBook.attemptLimitOrder("BUY", 52, 1, false);
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(2);
    expect(orderBook.trades[1].price).toBe(51);
    expect(orderBook.fullOrderBook.Asks.length).toBe(3);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Fully matched sell order at bid
    orderBook.attemptLimitOrder("SELL", 50, 1, false);
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(3);
    expect(orderBook.trades[2].price).toBe(50);
    expect(orderBook.fullOrderBook.Asks.length).toBe(3);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Fully matched sell order below bid
    orderBook.attemptLimitOrder("SELL", 49, 1, false);
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(4);
    expect(orderBook.trades[3].price).toBe(50);
    expect(orderBook.fullOrderBook.Asks.length).toBe(3);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Partially matched buy order at ask
    orderBook.attemptLimitOrder("BUY", 51, 30, false);
    expect(orderBook.ask).toBe(52);
    expect(orderBook.bid).toBe(51);
    expect(orderBook.trades.length).toBe(5);
    expect(orderBook.trades[4].price).toBe(51);
    expect(orderBook.fullOrderBook.Asks.length).toBe(2);
    expect(orderBook.fullOrderBook.Bids.length).toBe(4);

    // Partially matched sell order at bid
    orderBook.attemptLimitOrder("SELL", 51, 30, false);
    expect(orderBook.ask).toBe(51);
    expect(orderBook.bid).toBe(50);
    expect(orderBook.trades.length).toBe(6);
    expect(orderBook.trades[5].price).toBe(51);
    expect(orderBook.fullOrderBook.Asks.length).toBe(3);
    expect(orderBook.fullOrderBook.Bids.length).toBe(3);

    // Partially matched buy order above ask
    orderBook.attemptLimitOrder("BUY", 52, 100, false);
    expect(orderBook.ask).toBe(53);
    expect(orderBook.bid).toBe(52);
    expect(orderBook.trades.length).toBe(8);
    expect(orderBook.trades[6].price).toBe(51);
    expect(orderBook.trades[7].price).toBe(52);
    expect(orderBook.fullOrderBook.Asks.length).toBe(1);
    expect(orderBook.fullOrderBook.Bids.length).toBe(4);

    // Partially matched sell order below bid
    orderBook.attemptLimitOrder("SELL", 50, 100, false);
    expect(orderBook.ask).toBe(50);
    expect(orderBook.bid).toBe(49);
    expect(orderBook.trades.length).toBe(10);
    expect(orderBook.trades[8].price).toBe(52);
    expect(orderBook.trades[9].price).toBe(50);
    expect(orderBook.fullOrderBook.Asks.length).toBe(2);
    expect(orderBook.fullOrderBook.Bids.length).toBe(2);
  });
});
