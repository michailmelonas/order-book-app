const date = require("date-and-time");

module.exports.parseLimitOrders = function(orders, side) {
  return orders.map((o, i) => ({
    price: o.price, quantity: o.quantity, positionAtPrice: i+1, side: side, id: o.id
  }));
}

module.exports.parseOrderStatus = function(orderStatus) {
  return {
    side: orderStatus.side,
    price: orderStatus.price,
    postOnly: orderStatus.postOnly,
    originalQuantity: orderStatus.originalQuantity,
    id: orderStatus.id,
    dateCreated: date.format(orderStatus.dateCreated, "YYYY/MM/DD HH:mm:SSS"),
    dateLastUpdated: date.format(orderStatus.dateLastUpdated, "YYYY/MM/DD HH:mm:SSS"),
    remainingQuantity: orderStatus.remainingQuantity,
    status: orderStatus.status,
    cancelReason: orderStatus.cancelReason
  };
}

module.exports.parseParsedLimitOrdersToAggregated = function(orders, reverse) {
  const result = orders.reduce((result, currentValue) => {
    if (!result[currentValue.price]) {
      result[currentValue.price] = {
        price: currentValue.price, quantity: 0, side: currentValue.side, orderCount: 0
      };
    };
    result[currentValue.price].quantity += currentValue.quantity;
    result[currentValue.price].orderCount += 1;
    return result;
  }, {});
  if (reverse) return Object.values(result).reverse();
  return Object.values(result);
}

module.exports.parseTrades = function(trades) {
  return trades.map(t => ({
    price: t.price,
    quantity: t.quantity,
    takerSide: t.takerSide,
    tradedAt: date.format(t.dateCreated, "YYYY/MM/DD HH:mm:SSS"),
    id: t.id
  })).reverse();
}
