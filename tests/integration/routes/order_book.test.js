const supertest = require("supertest");

let app = require("../../../app");
const request = supertest(app);

// Populate order book
const orderBook = require("../../../routes/order_book").orderBook;
const id = orderBook.attemptLimitOrder("BUY", 10, 2, false);
orderBook.attemptLimitOrder("BUY", 10, 1, false);
orderBook.attemptLimitOrder("SELL", 10, 1, false);
orderBook.attemptLimitOrder("SELL", 11, 1, false);

describe("GET /api/full-order-book", () => {
  it("should return the full order book", async () => {
    const res = await request.get("/api/full-order-book");

    expect(res.status).toBe(200);
    expect(res.body.Asks.length).toBe(1);
    expect(res.body.Bids.length).toBe(2);
    expect(res.body.Asks[0].id).toBeTruthy();
    expect(res.body.Asks[0]).toMatchObject({price: 11, quantity: 1, side: "SELL", positionAtPrice: 1});
    expect(res.body.Bids[0].id).toBeTruthy();
    expect(res.body.Bids[0]).toMatchObject({price: 10, quantity: 1, side: "BUY", positionAtPrice: 1});
    expect(res.body.Bids[1].id).toBeTruthy();
    expect(res.body.Bids[1]).toMatchObject({price: 10, quantity: 1, side: "BUY", positionAtPrice: 2});
  });
});

describe("GET /api/aggregated-order-book", () => {
  it("should return the aggregated order book", async () => {
    const res = await request.get("/api/aggregated-order-book");

    expect(res.status).toBe(200);
    expect(res.body.Asks.length).toBe(1);
    expect(res.body.Bids.length).toBe(1);
    expect(res.body.Asks[0]).toMatchObject({price: 11, quantity: 1, side: "SELL", orderCount: 1});
    expect(res.body.Bids[0]).toMatchObject({price: 10, quantity: 2, side: "BUY", orderCount: 2});
  });
});

describe("GET /api/market-summary", () => {
  it("should return the market summary", async () => {
    const res = await request.get("/api/market-summary");

    expect(res.status).toBe(200);
    expect(res.body.lastTradeTime).toBeTruthy();
    expect(res.body).toMatchObject({ask: 11, bid: 10, lastTradedPrice: 10, askVolume: 1, bidVolume: 2});
  });
});

describe("GET /api/order-status/:id", () => {
  it("should return a 404 if an invalid id is passed", async () => {
    const res = await request.get("/api/order-status/abc");

    expect(res.status).toBe(404);
  });

  it("should return the order status associated with a valid id", async () => {
    const res = await request.get(`/api/order-status/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.dateCreated).toBeTruthy();
    expect(res.body.dateLastUpdated).toBeTruthy();
    expect(res.body.cancelReason).toBeNull();
    expect(res.body).toMatchObject({
      side: "BUY",
      price: 10,
      postOnly: false,
      originalQuantity: 2,
      id: id,
      remainingQuantity: 1,
      status: "Placed"
    });
  });
});

describe("GET /api/recent-trades/:count", () => {
  it("should return a 404 if an invalid count is passed", async () => {
    const res = await request.get("/api/recent-trades/-1");

    expect(res.status).toBe(404);
  });

  it("should return (up to) count number of recent trades", async () => {
    const res = await request.get(`/api/recent-trades/1`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].tradedAt).toBeTruthy();
    expect(res.body[0].id).toBeTruthy();
    expect(res.body[0]).toMatchObject({price: 10, quantity: 1, takerSide: "SELL"});
  });
});

describe("POST /api/orders/limit", () => {
  it.each([
    {},
    {side: "BUY", price: "1", quantity: "1"},
    {side: "BUY", price: 1, quantity: 1, postOnly: true},
  ])("should return a 400 if request body does not contain necessary fields of required types", async (request_body) => {
    const res = await request.post("/api/orders/limit").send(request_body);
    expect(res.status).toBe(400);
  });

  it("should return a 404 if an invalid request body is passed", async () => {
    const res = await request.post("/api/orders/limit").send(
      {side: "ABC", price: "1", quantity: "1", postOnly: true}
    );

    expect(res.status).toBe(404);
  });

  it("should return a valid order id if valid order placed", async () => {
    const res = await request.post("/api/orders/limit").send(
      {side: "BUY", price: "1", quantity: "1", postOnly: false}
    );

    expect(res.status).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(orderBook.getStatus(res.body.id).status).toBe("Placed");
  });
});
