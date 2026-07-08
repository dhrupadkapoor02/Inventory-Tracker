const express = require('express');
const { authenticate } = require('../middlewares/auth');
const controller = require('../controllers/inventoryLog.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAll);

module.exports = router;
