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
    console.log("🔥 Backend running on http://localhost:5000");
});


