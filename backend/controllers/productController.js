const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try{
        const {name, description, price, stock} = req.body;
        const product = await Product.create({name, description, price, stock});
        res.status(201).json({message: 'Product created successfully', product});
    }catch(error){
        res.status(500).json({message: 'Product creation failed', error: error.message});
    }   
}

exports.getProducts = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const q = req.query.q;
        const filter = q ? {name: {$regex: q, $options: 'i'}} : {};
        const products = await Product.find(filter).skip(skip).limit(limit);
        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        const nextPage = hasNextPage ? page + 1 : null;
        const previousPage = hasPreviousPage ? page - 1 : null;
        res.status(200).json({products, totalPages, hasNextPage, hasPreviousPage, nextPage, previousPage});
    }catch(error){
        res.status(500).json({message: 'Product retrieval failed', error: error.message});
    }
}

exports.updateProduct = async (req, res) => {
    try{
        const {id} = req.params;
        const {name, description, price, stock} = req.body;
        const product = await Product.findByIdAndUpdate(id, {name, description, price, stock}, {new: true});
        res.status(200).json({message: 'Product updated successfully', product});
    }catch(error){
        res.status(500).json({message: 'Product update failed', error: error.message});
    }
}  

exports.deleteProduct = async (req, res) => {
    try{
        const {id} = req.params;
        await Product.findByIdAndDelete(id);
        res.status(200).json({message: 'Product deleted successfully'});
    }catch(error){
        res.status(500).json({message: 'Product deletion failed', error: error.message});
    }
}

exports.getProductById = async (req, res) => {
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        res.status(200).json({product});
    }catch(error){
        res.status(500).json({message: 'Product retrieval failed', error: error.message});
    }
}