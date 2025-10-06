import { signup, signin, logout } from '#controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

router.post("/signin", signin);

router.post("/signup", signup);

router.post("/logout", logout);

export default router;