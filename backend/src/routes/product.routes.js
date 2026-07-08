const express = require('express');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/product.controller');
const { createProductSchema, updateProductSchema } = require('../validations/product.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN'), validate(createProductSchema), controller.create);
router.patch('/:id', authorize('ADMIN'), validate(updateProductSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;
