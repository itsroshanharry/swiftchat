import express from "express";
import { conversations } from "../controllers/messageControllers";

const router = express.Router();

router.get('/conversations', conversations)

export default router;