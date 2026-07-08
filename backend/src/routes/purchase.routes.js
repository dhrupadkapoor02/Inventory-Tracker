const express = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const controller = require('../controllers/purchase.controller');
const { createPurchaseSchema } = require('../validations/purchase.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createPurchaseSchema), controller.create);

module.exports = router;
