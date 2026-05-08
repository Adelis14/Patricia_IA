// routes/pizzaRoutes.js
const express = require('express');
const router = express.Router();

const { verPrincipal, consult_gpt } = require('../controllers/open_ai');

router.get('/', verPrincipal);
router.post('/prompt_gpt', consult_gpt);

module.exports = router;