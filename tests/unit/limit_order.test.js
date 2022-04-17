const LimitOrder = require("../../limit_order");

describe("limit_order.LimitOrder.constructor", () => {
  it("should create a LimitOrder instance", () => {
    const price = 1;
    const quantity = 1;
    const id = "abc";
    const dateCreated = new Date();
    const trade = new LimitOrder(price, quantity, id, dateCreated);

    expect(trade.price).toBe(price);
    expect(trade.quantity).toBe(quantity);
    expect(trade.id).toBe(id);
    expect(trade.dateCreated).toBe(dateCreated);
  });
});
