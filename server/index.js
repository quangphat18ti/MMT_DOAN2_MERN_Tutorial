const express = require('express');
const mongoose = require('mongoose')
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post')
require('dotenv').config(); // Lúc này ta có thể sử dụng process.evn.(property) để gọi ra các biến môi trường

const connectDB = async () => {
    try {
        // link URL to database
        const linkDB = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-tutorial.uy9zdxc.mongodb.net/mern-tutorial?retryWrites=true&w=majority`;

        await mongoose.connect(linkDB, {
            // useCreateIndex: true,
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: false
        });

        console.log("MongoDB connected");
    } catch (err) {
        console.log("Error message: ", err);
        process.exit(1);
    }
}
connectDB();

const app = express();
app.use(express.json())

app.get("/", (req, res) => res.send("Hello Word!"));
app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);

// local host app
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`server started on port ${PORT}`))