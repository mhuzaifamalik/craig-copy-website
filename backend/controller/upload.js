const express = require('express');
const { uploadImage, uploadVideo, uploadPdf } = require('../helper/upload');
const router = express.Router();

router.post('/image', uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.status(200).json({ message: 'File uploaded successfully', imageUrl });
});

router.post('/video', uploadVideo.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    res.status(200).json({ message: 'File uploaded successfully', videoUrl });
});

router.post('/document', uploadPdf.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const documentUrl = `/uploads/documents/${req.file.filename}`;
    res.status(200).json({ message: 'File uploaded successfully', documentUrl });
});

module.exports = router