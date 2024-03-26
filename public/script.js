const mediaList = document.getElementById('mediaList');
const mediaViewer = document.getElementById('mediaViewer');
const popup = document.getElementById("popup");
const popupName = document.getElementById("popup-name");
const popupItem = document.getElementById("popup-item");
const form = document.getElementById('upload-form');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');
const progressBarText = document.getElementById('progressBarText');
const messageDiv = document.getElementById('message');

var mediaDownloadName = '';
var mediaDownloadPath = '';

// First mediaList fetch
fetch('/files')
    .then(response => response.json())
    .then(data => {
        data.forEach(file => {
            const listItem = document.createElement('div');
            const mediaIcon = document.createElement('img');
            const mediaName = document.createElement('div');
            const fileExtension = getFileExtension(file.name);

            mediaIcon.id = "mediaIcon";
            mediaName.id = "mediaName";
            listItem.id = "listItem";

            listItem.addEventListener('click', () => file.isDirectory ? fetchFiles(sliceUp(file.path)) : openPopup(file.name, file.path));
            mediaName.textContent = file.name;
            mediaIcon.src = getIcon(fileExtension);

            listItem.appendChild(mediaIcon);
            listItem.appendChild(mediaName);
            mediaList.appendChild(listItem);
        });
    });

// Upload
document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const dosyaInput = document.getElementById('dosyaInput');
    const dosya = dosyaInput.files[0];

    if (!dosya) {
        showMessage('Please select a file.', 'error');
        return;
    }

    progressBarContainer.style.display = 'flex';

    const formData = new FormData();
    formData.append('dosya', dosya);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload');

    // Listen upload progress and update
    xhr.upload.addEventListener('progress', function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            updateProgressBar(percentComplete);
        }
    });

    xhr.onload = function () {
        if (xhr.status === 200) {
            showMessage('File uploaded succsessfully.', 'success');
        } else {
            showMessage('File could not be uploaded.', 'error');
        }
    };

    xhr.onerror = function () {
        showMessage('There is an error while uploading.', 'error');
    };

    xhr.send(formData);
});

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
}

function updateProgressBar(percentComplete) {
    progressBar.style.width = percentComplete + '%';
    progressBarText.textContent = Math.round(percentComplete) + '%';
}

function sliceUp(path) {
    //let newPath = path.replaceAll('\\', '/');
    let pos = path.search('media') + 6;
    return path.slice(pos);
}

async function fetchFiles(folderName) {
    mediaList.innerHTML = '';

    // Folder name
    const mediaFolder = document.createElement('div');
    mediaFolder.textContent = "Media/" + folderName.replace('\\', '/') + " Folder";
    mediaFolder.id = 'media-folder-name';
    mediaList.appendChild(mediaFolder);

    const mediaData = await fetch(`/browse/${folderName}`).then(response => response.json());
    mediaData.forEach(file => {
        const listItem = document.createElement('div');
        const mediaIcon = document.createElement('img');
        const mediaName = document.createElement('div');
        const fileExtension = getFileExtension(file.name);

        mediaIcon.id = "mediaIcon";
        mediaName.id = "mediaName";
        listItem.id = "listItem";

        listItem.addEventListener('click', () => file.isDirectory ? fetchFiles(sliceUp(file.path)) : openPopup(file.name, file.path));
        mediaName.textContent = file.name;
        mediaIcon.src = getIcon(fileExtension);

        listItem.appendChild(mediaIcon);
        listItem.appendChild(mediaName);
        mediaList.appendChild(listItem);
    });
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function getIcon(fileExtension) {
    switch (fileExtension) {
        case 'mp4':
        case 'webm':
        case 'mkv':
        case 'ts':
            return 'icons/video-icon.svg';
        case 'mp3':
        case 'ogg':
            return 'icons/audio-icon.svg';
        case 'jpg':
        case 'jpeg':
        case 'png':
            return 'icons/image-icon.svg';
            case 'txt':
            return 'icons/file-icon.svg'
        default:
            return 'icons/folder-icon.svg';
    }
}

function viewMedia(filename) {
    popupItem.innerHTML = '';

    if (filename.endsWith('.mp4') || filename.endsWith('.webm') || filename.endsWith('.mkv')) {
        const video = document.createElement('video');
        video.src = `/media/${filename}`;
        video.controls = true;
        popupItem.appendChild(video);
    } else if (filename.endsWith('.ts')) { // (Not works for now)
        const video = document.createElement('video');
        video.controls = true;
        video.className = "video-js vjs-default-skin";
        video.id = "video";
        //video.src = `/media/${filename}`;
        popupItem.appendChild(video);

        var player = videojs('video', {
            fluid: false,
            sources: [
                { src: `/media/${filename}`, type: 'video/mp2t' }
            ]
        });
    } else if (filename.endsWith('.mp3') || filename.endsWith('.ogg')) {
        const audio = document.createElement('audio');
        audio.src = `/media/${filename}`;
        audio.controls = true;
        popupItem.appendChild(audio);
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.svg')) {
        const image = document.createElement('img');
        image.src = `/media/${filename}`;
        popupItem.appendChild(image);
    }
}

function openPopup(fileName, filePath) {
    popup.style.display = "flex";
    popupName.innerHTML = `<p>${fileName}</p>`;
    mediaDownloadName = fileName;
    mediaDownloadPath = sliceUp(filePath);
    viewMedia(mediaDownloadPath);
}

function closePopup() {
    popup.style.display = "none";
    popupItem.innerHTML = '';
}

function mediaDownload() {
    //location.href = `/media/${mediaDownloadName}`;
    var downloadLink = document.createElement('a');
    downloadLink.href = `/media/${mediaDownloadPath}`;
    downloadLink.download = mediaDownloadName;
    downloadLink.click();
}
