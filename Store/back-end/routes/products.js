const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const PRODUCTS_DB = path.join(__dirname, "../db/products.json");

function readDB() {
    return JSON.parse(fs.readFileSync(PRODUCTS_DB, "utf8"));
}

// ✅ GET ALL CATEGORIES
router.get("/", (req, res) => {
    res.json(readDB());
});

// ✅ GET CATEGORY ONLY 
router.get("/:category", (req, res) => {
    const { category } = req.params;
    const products = readDB();

    if (!products[category]) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.json(products[category]);
});

// ✅ GET SPECIFIC PRODUCT
router.get("/:category/:id", (req, res) => {
    const products = readDB();
    const { category, id } = req.params;

    if (!products[category]) {
        return res.status(404).json({ message: "Category not found" });
    }

    const product = products[category].find(p => p.id == id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
});

module.exports = router;
