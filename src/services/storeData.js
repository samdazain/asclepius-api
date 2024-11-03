const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
require('dotenv').config();

const pathKey = path.resolve(process.env.FIRESTORE_KEY_PATH)

async function storeData(id, data) {

    try {
        const db = new Firestore({
            projectId: 'submissionmlgc-samdazain',
            keyFilename: pathKey,
        });

        const predictCollection = db.collection('predictions');
        return predictCollection.doc(id).set(data);
    } catch (error) {
        console.error(error);
    }
}

module.exports = storeData;