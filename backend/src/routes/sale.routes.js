const express = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const controller = require('../controllers/sale.controller');
const { createSaleSchema } = require('../validations/sale.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createSaleSchema), controller.create);

module.exports = router;
