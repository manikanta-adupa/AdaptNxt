const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
        select: false,
        minlength: 8,
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
}, {timestamps: true});

UserSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

UserSchema.pre('save', async function(next){
    try{
        if(!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }catch(error){
        next(error);
    }
});

module.exports = mongoose.model('User', UserSchema);