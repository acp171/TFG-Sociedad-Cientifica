const CloudinaryStorageObj = require('multer-storage-cloudinary');
const CloudinaryStorage = CloudinaryStorageObj.CloudinaryStorage || CloudinaryStorageObj;
const multer = require('multer');
const cloudinary = require('cloudinary');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'articulos',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
    },
});

const upload = multer({ storage });

module.exports = upload;