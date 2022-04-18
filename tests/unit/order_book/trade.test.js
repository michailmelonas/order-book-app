const Trade = require("../../../order_book/trade");

describe("trade.Trade.constructor", () => {
  it("should create a Trade instance", () => {
    const price = 1;
    const quantity = 1;
    const takerSide = "BUY";
    const dateCreated = new Date();
    const trade = new Trade(price, quantity, takerSide, dateCreated);

    expect(trade.price).toBe(price);
    expect(trade.quantity).toBe(quantity);
    expect(trade.takerSide).toBe(takerSide);
    expect(trade.dateCreated).toBe(dateCreated);
    expect(trade.id).toBeTruthy();
  });
});
