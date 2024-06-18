import express from "express";
import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ||  8080;

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get('/', (req, res) => {
    res.send("Hello world");
});

app.listen(PORT, () => {
    console.log("Server is running on port", +PORT);
});
