const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart || cart.products.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Check stock availability and calculate total
        let totalAmount = 0;
        for (const item of cart.products) {
            const product = await Product.findById(item.product._id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
            }
            totalAmount += product.price * item.quantity;
        }

        // Decrement stock (best-effort)
        for (const item of cart.products) {
            await Product.updateOne(
                { _id: item.product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Create order
        const order = await Order.create({ user: userId, products: cart.products, totalAmount });

        // Clear cart
        await Cart.deleteOne({ _id: cart._id });

        await order.populate('products.product');
        res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
}

module.exports.getUserOrders = async (req, res) => {
    try{
        const userId = req.user._id;
        const orders = await Order.find({user: userId});
        res.status(200).json({orders});
    }catch(error){
        res.status(500).json({message: 'Failed to get user orders', error: error.message});
    }
}

module.exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('products.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // allow owner or admin only
        if (
            req.user.role !== 'admin' &&
            order.user.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get order', error: error.message });
    }
}