const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({message: 'Unauthorized'});
        }
        req.user = user;
        next();
    }catch(error){
        return res.status(401).json({message: 'Unauthorized'});
    }
}