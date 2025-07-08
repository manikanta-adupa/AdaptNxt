const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports.addCartItem = async (req, res) => {
    try{
        const { productId, quantity: qty } = req.body;
        const quantity = parseInt(qty ?? 1, 10);
        if (Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be a positive integer' });
        }
        const userId = req.user._id;
        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $setOnInsert: { products: [] } },
            { new: true, upsert: true }
        );
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }   
        const existingItem = cart.products.find(item => item.product.toString() === productId);
        if(existingItem){
            existingItem.quantity += quantity;
        }else{
            cart.products.push({product: productId, quantity});
        }
        await cart.save();
        await cart.populate('products.product');
        res.status(201).json({ message: 'Product added to cart', cart });
    }catch(error){
        res.status(500).json({message: 'Failed to add product to cart', error: error.message});
    }
}


module.exports.updateCartItem = async (req, res) => {
    try{
        const { productId } = req.params;
        const quantity = parseInt(req.body.quantity, 10);
        if (Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be a positive integer' });
        }
        const userId = req.user._id;
        const cart = await Cart.findOne({user: userId});
        if(!cart){
            return res.status(404).json({message: 'Cart not found'});
        }
        const existingItem = cart.products.find(item => item.product.toString() === productId);
        if(!existingItem){
            return res.status(404).json({message: 'Product not found in cart'});
        }
        existingItem.quantity = quantity;
        await cart.save();
        await cart.populate('products.product');
        res.status(200).json({ message: 'Cart updated', cart });
    }catch(error){
        res.status(500).json({message: 'Failed to update cart', error: error.message});
    }
}

module.exports.deleteCartItem = async (req, res) => {
    try{
        const {productId} = req.params;
        const userId = req.user._id;
        const cart = await Cart.findOne({user: userId});
        if(!cart){
            return res.status(404).json({message: 'Cart not found'});
        }
        cart.products = cart.products.filter(item => item.product.toString() !== productId);
        await cart.save();
        await cart.populate('products.product');
        res.status(200).json({ message: 'Cart item deleted', cart });
    }catch(error){
        res.status(500).json({message: 'Failed to delete cart item', error: error.message});    
    }
}

module.exports.getCartItems = async (req, res) => {
    try{
        //List all cart items
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        if(!cart){
            return res.status(404).json({message: 'Cart not found'});
        }
        res.status(200).json({cart});  
    }catch(error){
        res.status(500).json({message: 'Failed to get cart items', error: error.message});
    }
}
