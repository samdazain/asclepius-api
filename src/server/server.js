require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    const app = express();
    const port = 8000;
    const host = '0.0.0.0';

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Load the model
    const model = await loadModel();
    app.set('model', model); // Store model in app locals

    // Routes
    app.use('/', routes);

    // Error handling middleware
    app.use((err, req, res, next) => {
        if (err instanceof InputError) {
            return res.status(err.statusCode).json({
                status: 'fail',
                message: err.message,
            });
        }

        // Handle other errors
        return res.status(err.status || 500).json({
            status: 'fail',
            message: err.message || 'Internal Server Error',
        });
    });

    app.listen(port, host, () => {
        console.log(`Server is running at http://${host}:${port}`);
    });
})();
