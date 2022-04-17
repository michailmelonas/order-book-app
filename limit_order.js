class LimitOrder {
  constructor(price, quantity, id, dateCreated) {
    this.price = price;
    this.quantity = quantity;
    this.id = id;
    this.dateCreated = dateCreated;
  }
}

module.exports = LimitOrder;
