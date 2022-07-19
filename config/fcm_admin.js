const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin.json");

const fcm_admin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = {
    fcm_admin: fcm_admin
}