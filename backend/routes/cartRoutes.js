const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, cartController.addCartItem);
router.put('/:productId', authenticateToken, cartController.updateCartItem);
router.delete('/:productId', authenticateToken, cartController.deleteCartItem);
router.get('/', authenticateToken, cartController.getCartItems);

module.exports = router;