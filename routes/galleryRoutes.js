// routes/galleryRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const router = express.Router();

// Use the S3-based upload middleware
const upload = require('../middleware/upload');

// POST route for uploading an image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { category, email } = req.body;
    // req.file.location contains the S3 URL
    const newImage = new Gallery({
      url: req.file.location,
      category,
      email,
    });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(400).json({ message: 'Failed to upload image.' });
  }
});

// GET route for fetching images by user email
router.get('/:email', async (req, res) => {
  try {
    const images = await Gallery.find({ email: req.params.email });
    res.json(images);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch images.' });
  }
});

module.exports = router;
