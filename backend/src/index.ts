import express from "express";
import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get('/', (req, res) => {
    res.send("Hello world");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
