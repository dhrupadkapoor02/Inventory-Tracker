const express = require('express');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const controller = require('../controllers/category.controller');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN'), validate(createCategorySchema), controller.create);
router.patch('/:id', authorize('ADMIN'), validate(updateCategorySchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;
