const express = require('express');
const { authenticate } = require('../middlewares/auth');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(authenticate);

router.get('/summary', controller.getSummary);

module.exports = router;
