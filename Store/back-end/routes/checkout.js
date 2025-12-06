const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const ORDERS_DB = path.join(__dirname, "../db/orders.json");

function readDB() {
    return JSON.parse(fs.readFileSync(ORDERS_DB, "utf8"));
}

function writeDB(data) {
    fs.writeFileSync(ORDERS_DB, JSON.stringify(data, null, 2));
}

router.post("/", (req, res) => {
    const { cart, total } = req.body;

    let orders = readDB();

    const newOrder = {
        id: Date.now(),
        cart,
        total,
        date: new Date().toISOString()
    };

    orders.push(newOrder);
    writeDB(orders);

    res.json({ message: "Order placed", orderId: newOrder.id });
});

module.exports = router;
