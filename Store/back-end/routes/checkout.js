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
    const { cart, total, cardHolder, cardLast4, paymentMethod } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty or invalid" });
    }

    let orders = readDB();

    const newOrder = {
        id: "PV" + Math.floor(100000 + Math.random() * 900000),
        cart,
        total,
        date: new Date().toISOString(),

        // Payment info
        cardHolder: cardHolder || "N/A",
        cardLast4: cardLast4 || "XXXX",
        paymentMethod: paymentMethod || "Card"
    };

    orders.push(newOrder);
    writeDB(orders);

    return res.json({
        message: "Order placed",
        order: newOrder
    });
});

module.exports = router;
