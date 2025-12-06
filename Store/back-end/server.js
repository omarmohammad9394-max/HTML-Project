const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// ROUTES
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/checkout", require("./routes/checkout"));

app.listen(5000, () => {
    console.log("🔥 New Backend running on http://localhost:5000");
});


const fs = require("fs");
const express = require("express");

app.use(express.json());

app.post("/api/save-order", (req, res) => {
    const newOrder = req.body;

    fs.readFile("db/orders.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading orders.json");

        let orders = [];
        if (data.trim() !== "") orders = JSON.parse(data);

        orders.push(newOrder);

        fs.writeFile("db/orders.json", JSON.stringify(orders, null, 2), (err) => {
            if (err) return res.status(500).send("Error saving order");
            res.json({ success: true });
        });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
