const {v4: uuid4} = require("uuid");

class Trade {
  constructor(price, quantity, takerSide, dateCreated) {
    this.price = price;
    this.quantity = quantity;
    this.takerSide = takerSide;
    this.dateCreated = dateCreated;
    this.id = uuid4();
  }
}

module.exports = Trade;
