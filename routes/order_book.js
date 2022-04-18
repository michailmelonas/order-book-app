const OrderBook = require("../order_book/order_book");

const express = require("express");
const Joi = require("joi");

const router = express.Router();
const orderBook = new OrderBook(1000000);

router.get("/full-order-book", (req, res) => {
  res.send(orderBook.fullOrderBook);
});

router.get("/aggregated-order-book", (req, res) => {
  res.send(orderBook.aggregatedOrderBook);
});

router.get("/market-summary", (req, res) => {
  res.send(orderBook.marketSummary);
});

router.get("/order-status/:id", (req, res) => {
  try { status = orderBook.getStatus(req.params.id); }
  catch(err) { return res.status(404).send(err.message); }
  res.send(status);
});

router.get("/recent-trades/:count", (req, res) => {
  try { recentTradeHistory = orderBook.getRecentTradeHistory(parseInt(req.params.count)); }
  catch(err) { return res.status(404).send(err.message); }
  res.send(recentTradeHistory)
});

router.post("/orders/limit", (req, res) => {
  schema = Joi.object({
    "side": Joi.string().required(),
    "quantity": Joi.string().pattern(new RegExp("^[0-9]+$")).min(1).required(),
    "price": Joi.string().pattern(new RegExp("^[0-9]+$")).min(1).required(),
    "postOnly": Joi.boolean().required()
  });
  const {error} = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    id = orderBook.attemptLimitOrder(
      req.body.side, parseInt(req.body.price), parseInt(req.body.quantity), req.body.postOnly
    );
  }
  catch(err) { return res.status(400).send(err.message); }
  res.send(id);
});

module.exports = router;
