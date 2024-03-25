const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 3000;

// Tüm isteklere CORS izinlerini ekleyin (sadece local için güvenli)
app.use(cors());

// Public
const publicPath = path.join(__dirname, 'public');
// Media klasörü belirlendi
const mediaPath = path.join(publicPath, 'media');
// Dosyaların yükleneceği klasör belirlendi
const uploadDir = path.join(mediaPath, 'Uploads');

// Public klasörünü statik olarak sun
app.use(express.static(publicPath));

// Eğer Media klasörü yoksa, oluştur
if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath);
}

// Eğer Uploads klasörü yoksa, oluştur
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

// Ana sayfa için route
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Dosya listesini al ve klasörleri diğer dosya türlerinden önce tutarak sırala
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

// Klasör içeriğini listele
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

// Media klasörü dosyaları
app.get('/files', (req, res) => {
    const files = listFiles(mediaPath);
    const sortedFiles = sortFiles(files);

    res.send(sortedFiles);
});

// Klasör içeriğini dinleme
app.get('/browse/:folder/:subfolder?', (req, res) => {
    const folderPath = req.params.subfolder
        ? path.join(__dirname, 'public/media', req.params.folder, req.params.subfolder)
        : path.join(__dirname, 'public/media', req.params.folder);

    const files = listFiles(folderPath);
    const sortedFiles = sortFiles(files);

    res.send(sortedFiles);
});

// Dosya yükleme için multer ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Ana sayfa
  app.get('/', (req, res) => {
    res.send('Dosya Yükleme Projesine Hoş Geldiniz!');
  });
  
  // Dosya yükleme endpoint'i
  app.post('/upload', upload.single('dosya'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Dosya yüklenemedi.');
    }
    res.send('Dosya başarıyla yüklendi.');
  });

// Server'ı dinle
app.listen(port, () => {
    console.log(`Uygulama http://localhost:${port} adresinde çalışıyor.`);
});
