import express from "express";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/messageControllers";
import protectRoute from "../middleware/protectRoute";

const router = express.Router();

router.get('/conversations', protectRoute, getUsersForSidebar)
router.get('/:id', protectRoute, getMessages)
router.post('/send/:id',protectRoute, sendMessage)


export default router;