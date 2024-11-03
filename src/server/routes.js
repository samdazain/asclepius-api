const express = require('express');
const router = express.Router();
const multer = require('multer');
const { postPredictHandler, predictHistories } = require('./handler');

const upload = multer({
    limits: { fileSize: 1000 * 1000 },
    storage: multer.memoryStorage(),
});

// Middleware to check JSON payload size limit for non-file requests
router.use(express.json({ limit: '1mb' }));

// Default route
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the Cancer Prediction API!',
    });
});

// POST /predict
router.post('/predict', upload.single('image'), postPredictHandler);

// GET /predict/histories
router.get('/predict/histories', predictHistories);

// Global error handler for 413 errors
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE' || err instanceof SyntaxError) {
        res.status(413).json({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000',
        });
    } else {
        next(err);
    }
});

module.exports = router;
