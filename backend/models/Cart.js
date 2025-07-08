const mongoose = require('mongoose');



const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
    }],
},{timestamps: true});

//index on user so lookup is faster
CartSchema.index({user: 1});

//pre save hook to ensure products are in the correct format
CartSchema.pre('save', async function(next){
    if(!this.isModified('products')) return next();
    this.products = this.products.map(item => ({
        product: item.product,
        quantity: item.quantity,
    }));
    next();
});

module.exports = mongoose.model('Cart', CartSchema);