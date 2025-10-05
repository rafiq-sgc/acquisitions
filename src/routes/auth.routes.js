import express from 'express';

const router = express.Router();

router.post("/sigin", (req, res) => {
    res.status(200).send("Sign In Route");
});

router.post("/signup", (req, res) => {
    res.status(200).send("Sign Up Route");
});

router.post("/logout", (req, res) => {
    res.status(200).send("Logout Route");
});

export default router;