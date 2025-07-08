const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const productController = require('../controllers/productController');

router.post('/', authenticateToken, checkRole(['admin']), productController.createProduct);
router.get('/', productController.getProducts);
router.put('/:id', authenticateToken, checkRole(['admin']), productController.updateProduct);
router.delete('/:id', authenticateToken, checkRole(['admin']), productController.deleteProduct);
router.get('/:id', productController.getProductById);

module.exports = router;