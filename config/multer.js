const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'fullstack_blog_project',
        allowedFormats: ["jpg", "png"],
        transformation: [{
            width: 600,
            height: 400,
        }]
    }
});

const upload = multer({ storage });

module.exports = upload;