const Status = require("../../status");

describe("status.Status.constructor", () => {
  it("should create a Status instance", () => {
    const side = "BUY";
    const price = 1;
    const postOnly = false;
    const originalQuantity = 1;
    const id = "abc";
    const dateCreated = new Date();
    const status = new Status(side, price, postOnly, originalQuantity, id, dateCreated);

    expect(status.side).toBe(side);
    expect(status.price).toBe(price);
    expect(status.postOnly).toBe(postOnly);
    expect(status.originalQuantity).toBe(originalQuantity);
    expect(status.id).toBe(id);
    expect(status.dateCreated).toBe(dateCreated);
    expect(status.dateLastUpdated).toBe(dateCreated);
    expect(status.remainingQuantity).toBe(originalQuantity);
    expect(status.status).toBe("Pending");
    expect(status.cancelReason).toBeNull();
  });
});

describe("status.Status.fillNewOrder", () => {
  it("should throw an error when current state is not pending", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.status = "Completed";

    expect(() => status.fillNewOrder(dateLastUpdated, 1)).toThrow();
  });

  it("should throw an error when dateLastUpdated is earlier than current dateLastUpdated", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() - 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);

    expect(() => status.fillNewOrder(dateLastUpdated, 1)).toThrow();
  });

  it("should throw an error when quantity is larger than remainingQuantity", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);

    expect(() => status.fillNewOrder(dateLastUpdated, 2)).toThrow();
  });

  it("should fill new order partially", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 2, "abc", dateCreated);
    status.fillNewOrder(dateLastUpdated, 1);

    expect(status.dateLastUpdated).toBe(dateLastUpdated);
    expect(status.remainingQuantity).toBe(1);
    expect(status.status).toBe("Pending");
  });

  it("should fill new order completely", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.fillNewOrder(dateLastUpdated, 1);

    expect(status.dateLastUpdated).toBe(dateLastUpdated);
    expect(status.remainingQuantity).toBe(0);
    expect(status.status).toBe("Completed");
  });
});

describe("status.Status.fillExistingOrder", () => {
  it("should throw an error when current state is not placed", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.status = "Completed";

    expect(() => status.fillExistingOrder(dateLastUpdated, 1)).toThrow();
  });

  it("should throw an error when dateLastUpdated is earlier than current dateLastUpdated", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() - 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);

    expect(() => status.fillExistingOrder(dateLastUpdated, 1)).toThrow();
  });

  it("should throw an error when quantity is larger than remainingQuantity", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);

    expect(() => status.fillExistingOrder(dateLastUpdated, 2)).toThrow();
  });

  it("should fill existing order partially", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 2, "abc", dateCreated);
    status.status = "Placed";
    status.fillExistingOrder(dateLastUpdated, 1);

    expect(status.dateLastUpdated).toBe(dateLastUpdated);
    expect(status.remainingQuantity).toBe(1);
    expect(status.status).toBe("Placed");
  });

  it("should fill existing order completely", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.status = "Placed";
    status.fillExistingOrder(dateLastUpdated, 1);

    expect(status.dateLastUpdated).toBe(dateLastUpdated);
    expect(status.remainingQuantity).toBe(0);
    expect(status.status).toBe("Completed");
  });
});

describe("status.Status.cancelOrder", () => {
  it("should throw an error when dateLastUpdated is earlier than current dateLastUpdated", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() - 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);

    expect(() => status.cancelOrder(dateLastUpdated, "reason")).toThrow();
  });

  it("should throw an error when current state is not pending", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.status = "Completed";

    expect(() => status.cancelOrder(dateLastUpdated, "reason")).toThrow();
  });

  it("should cancel pending order", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.cancelOrder(dateLastUpdated, "reason")

    expect(status.dateLastUpdated).toBe(dateLastUpdated);
    expect(status.status).toBe("Cancelled");
    expect(status.cancelReason).toBe("reason");
  });
});

describe("status.Status.setOrderStatusToPlaced", () => {
  it("should throw an error when dateLastUpdated is earlier than current dateLastUpdated", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() - 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);

    expect(() => status.setOrderStatusToPlaced(dateLastUpdated, "reason")).toThrow();
  });

  it("should throw an error when current state is not pending", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.status = "Completed";

    expect(() => status.setOrderStatusToPlaced(dateLastUpdated, "reason")).toThrow();
  });

  it("should set order status to placed", () => {
    const dateCreated = new Date(); const dateLastUpdated = new Date();
    dateLastUpdated.setSeconds(dateLastUpdated.getSeconds() + 1);
    const status = new Status("BUY", 1, false, 1, "abc", dateCreated);
    status.setOrderStatusToPlaced(dateLastUpdated)

    expect(status.dateLastUpdated).toBe(dateLastUpdated);
    expect(status.status).toBe("Placed");
  });
});
