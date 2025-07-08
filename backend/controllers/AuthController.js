const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try{
        const {username, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        const user = await User.create({username, email, password});
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        const safeUser = { _id: user._id, username: user.username, email: user.email, role: user.role };
        res.status(201).json({ message: 'User created successfully', token, user: safeUser });
    }catch(error){
        res.status(500).json({message: 'Registration failed', error: error.message});
    }
}

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        const safeUser = { _id: user._id, username: user.username, email: user.email, role: user.role };
        res.status(200).json({ message: 'Login successful', token, user: safeUser });
    }catch(error){
        res.status(500).json({message: 'Login failed', error: error.message});
    }
};