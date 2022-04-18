const express = require("express");
const morgan = require("morgan");

const orderBook = require("./routes/order_book");

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use("/api", orderBook);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
