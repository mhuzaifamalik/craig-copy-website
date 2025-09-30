const fs = require('fs');
const path = require('path');
const multer = require("multer");

const createDirectoryIfNotExists = (dir) => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true }); // Ensure parent directories are created
    }
    return fullPath;
};

const docStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = './views/uploads/documents';
        cb(null, createDirectoryIfNotExists(dir));
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}${Date.now()}.${file.originalname.split('.').pop()}`);
    }
});

const pdfFilter = (req, file, cb) => {
    // only PDF files
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = './views/uploads/images';
        cb(null, createDirectoryIfNotExists(dir));
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}${Date.now()}.${file.originalname.split('.').pop()}`);
    }
});

const imagesFilter = (req, file, cb) => {
    // only JPG, PNG, and WEBP files
    console.log(file.mimetype);
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = './views/uploads/videos';
        cb(null, createDirectoryIfNotExists(dir));
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}${Date.now()}.${file.originalname.split('.').pop()}`);
    }
});

const videoFilter = (req, file, cb) => {
    // only MP4, AVI, and MKV files
    if (["video/mp4", "video/x-msvideo", "video/x-matroska"].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const uploadPdf = multer({
    storage: docStorage,
    fileFilter: pdfFilter
});

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imagesFilter
});

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFilter
});

module.exports = { uploadPdf, uploadImage, uploadVideo };