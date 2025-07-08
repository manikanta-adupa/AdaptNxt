const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./middleware/auth');
const { checkRole } = require('./middleware/role');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
//config
dotenv.config();

//middleware
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/protected', authenticateToken, (req, res) => {
    res.status(200).json({message: 'Protected route', user: req.user});
});

app.get('/api/admin', authenticateToken, checkRole(['admin']), (req, res) => {
    res.status(200).json({message: 'Admin route', user: req.user});
});

//database
mongoose.connect(process.env.MONGODB_URI,{
    //useNewUrlParser and useUnifiedTopology are deprecated, but we need to use them for now
    //https://mongoosejs.com/docs/deprecations.html
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    //if error connecting to MongoDB, log error and exit process with failure
    console.log('Error connecting to MongoDB', err);
    //exit process with failure
    process.exit(1);
});

app.get('/api/health', (req, res) => {
    // if server is running, return 200 status code and Node_env value else return 500 status code
    res.status(200).json({
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        node_env: process.env.NODE_ENV,
        port: process.env.PORT
    });
});

// Adding a 404 handler middleware  
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

