// routes/supportRoutes.js
const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");

router.post("/chat", supportController.startChat);
router.post("/message", supportController.sendMessage);

module.exports = router;
