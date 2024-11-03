const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const path = require('path');
require('dotenv').config();

async function postPredictHandler(req, res, next) {
    try {
        const image = req.file ? req.file.buffer : req.body.image;

        if (!image) {
            return res.status(400).json({
                status: 'fail',
                message: 'Image data is required',
            });
        }

        const model = req.app.get('model');
        const { confidenceScore, label, suggestion } = await predictClassification(model, image);

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = { id, result: label, suggestion, createdAt };

        // store data to Firestore
        await storeData(id, data);

        res.status(201).json({
            status: 'success',
            message: confidenceScore > 99
                ? "Model is predicted successfully"
                : "Model is predicted successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function predictHistories(req, res, next) {
    try {
        const model = req.app.get('model');
        const pathKey = path.resolve(process.env.FIRESTORE_KEY_PATH);
        const { Firestore } = require("@google-cloud/firestore");
        const db = new Firestore({
            projectId: "submissionmlgc-samdazain",
            keyFilename: pathKey,
        });
        const predictCollection = db.collection("predictions");
        const snapshot = await predictCollection.get();

        const result = snapshot.docs.map(doc => ({
            id: doc.id,
            history: {
                result: doc.data().result,
                createdAt: doc.data().createdAt,
                suggestion: doc.data().suggestion,
                id: doc.data().id,
            },
        }));

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { postPredictHandler, predictHistories };
