const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const router = express.Router();

// SAFE path to users.json
const USERS_DB = path.join(__dirname, "../db/users.json");

const JWT_SECRET = "PrimeVaultSecret";

function readDB() {
    return JSON.parse(fs.readFileSync(USERS_DB, "utf8"));
}

function writeDB(data) {
    fs.writeFileSync(USERS_DB, JSON.stringify(data, null, 2));
}

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let users = readDB();

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        users.push({
            id: Date.now(),
            name,
            email,
            password: hashed
        });

        writeDB(users);

        res.json({ message: "Signup successful" });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        let users = readDB();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
