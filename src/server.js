const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Pdf = require('./models/Pdf'); // Import the Pdf model

const app = express();

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://admin:admin%4013@dental.9jmol.mongodb.net/dental?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
});

// Middleware for authentication
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// Set up file upload using multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with unique name
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
    },
});

// Route for uploading PDFs
app.post('/upload-pdf', authenticate, upload.single('pdf'), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const newPdf = new Pdf({
            filename: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            description: req.body.description || '', // Optional description
        });

        await newPdf.save();
        res.json({ message: 'PDF uploaded and saved successfully!', pdf: newPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading PDF', error });
    }
});

// Start the server
app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});
