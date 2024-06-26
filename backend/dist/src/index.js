import path from "path";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import { app, server } from "../socket/socket.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
if (process.env.NODE_ENV !== "development") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
    });
}
app.get('/', (req, res) => {
    res.send("Hello world");
});
server.listen(PORT, () => {
    console.log("Server is running on port", +PORT);
});
