const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');

// Configure AWS SDK (credentials are picked up from IAM role or env vars)
aws.config.update({
    region: process.env.AWS_REGION,
    // credentials will be automatically loaded from IAM role on EC2
    // or from AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env for local dev
});

const s3 = new aws.S3();

// File filter for images only
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only! (jpeg, jpg, png)');
    }
}

// Multer S3 storage
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read', // or 'private' if you want to restrict access
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Use user email if available, otherwise Date.now()
            const userEmail = req.user ? req.user.email : 'anonymous';
            cb(null, userEmail + '_' + Date.now() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
