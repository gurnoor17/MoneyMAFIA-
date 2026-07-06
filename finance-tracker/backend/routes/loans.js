const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    addLoan,
} = require("../controllers/loanController");

// Add Loan
router.post("/", authMiddleware, addLoan);

module.exports = router;