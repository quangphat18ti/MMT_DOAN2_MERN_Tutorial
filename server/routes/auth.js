const express = require("express");
const router = express.Router();
const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

router.get("/", (request, response) => response.send("USER ROUTE"));

// @route POST api/auth/register
// @desc Register user
// @access Public
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res
            .status(400)
            .json({ success: false, message: "Missing username and/or password" });
    }

    // Bắt đầu nói chuyện DB thì nên đưa vào try catch
    try {
        // Check for existing user
        const user = await User.findOne({ username });

        if (user) {
            return res
                .status(400)
                .json({ success: false, message: "Username already!" });
        }

        // All good and success

        // Hash password
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();

        // Return Token
        const accessToken = jwt.sign(
            { userID: newUser._id },
            process.env.ACCESS_TOKEN_SECRET
        );

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            accessToken,
        });
    } catch (error) {
        console.log("Error Register = ", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Problem" });
    }
});

// @route POST api/auth/login
// @desc Login user
// @access Public

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res
            .status(400)
            .json({ success: false, message: "Missing username and/or password" });
    }

    try {
        // check user
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Incorrect username or password" });
        }

        // check password
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) {
            return res
                .status(400)
                .json({ success: false, message: "Incorrect username or password" });
        }

        // All good
        // Return Token
        const accessToken = jwt.sign(
            { userID: user._id },
            process.env.ACCESS_TOKEN_SECRET
        );

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken,
        });
    } catch (error) {
        console.log("Error Register = ", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Problem" });
    }
});

module.exports = router;
