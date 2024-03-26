const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3000;

// Allow CORS permissions to all requests
// Safe for local use only !
app.use(cors());

// Public
const publicPath = path.join(__dirname, 'public');
// Media folder defined
const mediaPath = path.join(publicPath, 'media');
// Upload folder defined
const uploadDir = path.join(mediaPath, 'Uploads');

// Public folder for static use
app.use(express.static(publicPath));

// If there is no media folder, create it
if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath);
}

// If there is no upload folder, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Root location for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Get file list and sort folders before other file types
function sortFiles(files) {
    return files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) {
            return -1;
        } else if (!a.isDirectory && b.isDirectory) {
            return 1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
}

// List folder contents
function listFiles(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    return files.map((file) => {
        const fullPath = path.join(directory, file.name);
        return {
            name: file.name,
            isDirectory: file.isDirectory(),
            path: fullPath,
        };
    });
}

// Files inside media folder
app.get('/files', (req, res) => {
    const files = listFiles(mediaPath);
    const sortedFiles = sortFiles(files);

    res.send(sortedFiles);
});

// Get the contents of the desired folder
app.get('/browse/:folder/:subfolder?', (req, res) => {
    const folderPath = req.params.subfolder
        ? path.join(__dirname, 'public/media', req.params.folder, req.params.subfolder)
        : path.join(__dirname, 'public/media', req.params.folder);

    const files = listFiles(folderPath);
    const sortedFiles = sortFiles(files);

    res.send(sortedFiles);
});

// multer settings for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload', upload.single('dosya'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('The file could not be uploaded.');
    }
    res.send('The file has been uploaded successfully.');
});

// Listens server
app.listen(port, () => {
    console.log(`The server runs at http://localhost:${port}.`);
});
