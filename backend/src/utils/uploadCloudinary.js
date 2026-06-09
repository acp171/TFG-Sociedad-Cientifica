const CloudinaryStorageObj = require('multer-storage-cloudinary');
const CloudinaryStorage = CloudinaryStorageObj.CloudinaryStorage || CloudinaryStorageObj;
const multer = require('multer');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'articulos', // carpeta en tu cuenta Cloudinary
        resource_type: 'raw', // para subir archivos como PDF
        allowed_formats: ['pdf'],
    },
});

const upload = multer({ storage });

module.exports = upload;