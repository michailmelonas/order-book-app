class Status {
  constructor(side, price, postOnly, originalQuantity, id, dateCreated) {
    this.side = side;
    this.price = price;
    this.postOnly = postOnly;
    this.originalQuantity = originalQuantity;
    this.id = id;
    this.dateCreated = dateCreated;
    this.dateLastUpdated = dateCreated;
    this.remainingQuantity = originalQuantity;
    this.status = "Pending";
    this.cancelReason = null;
  }

  fillNewOrder(dateLastUpdated, quantity) {
    if (this.status !== "Pending") {
      throw new Error(`Cannot fill new order having status ${this.status}`);
    };
    this.#fillOrder(dateLastUpdated, quantity);
  }

  fillExistingOrder(dateLastUpdated, quantity) {
    if (this.status !== "Placed") {
      throw new Error(`Cannot fill existing order having status ${this.status}`);
    };
    this.#fillOrder(dateLastUpdated, quantity);
  }

  cancelOrder(dateLastUpdated, cancelReason) {
    this.#validateUpdateDate(dateLastUpdated);
    if (this.status !== "Pending") {
      throw new Error(`Cannot cancel order having status ${this.status}`);
    };

    this.dateLastUpdated = dateLastUpdated;
    this.status = "Cancelled";
    this.cancelReason = cancelReason;
  };

  setOrderStatusToPlaced(dateLastUpdated) {
    this.#validateUpdateDate(dateLastUpdated);
    if (this.status !== "Pending") {
      throw new Error(`Cannot change status from ${this.status} to Placed`);
    };

    this.dateLastUpdated = dateLastUpdated;
    this.status = "Placed";
  }

  #validateUpdateDate(dateLastUpdated) {
    if (dateLastUpdated < this.dateLastUpdated) {
      throw new Error(`dateLastUpdated (${dateLastUpdated}) cannot be older than previous dateLastUpdated (${this.dateLastUpdated})`);
    };
  }

  #fillOrder(dateLastUpdated, quantity) {
    this.#validateUpdateDate(dateLastUpdated);
    if (quantity > this.remainingQuantity) {
      throw new Error(`Remaing quantity (${this.remainingQuantity}) is less than ${quantity}`);
    };

    this.dateLastUpdated = dateLastUpdated;
    this.remainingQuantity -= quantity;
    if (this.remainingQuantity === 0) this.status = "Completed";
  }
}

module.exports = Status;
