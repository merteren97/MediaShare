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

function viewMedia(filePath) {
    popupItem.innerHTML = '';

    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.mkv') || filePath.endsWith('.ts')) {
        /*const video = document.createElement('video'); // old video system
        video.src = `/media/${filepath}`;
        video.controls = true;
        video.type = "video/mp4"
        popupItem.appendChild(video); */
        const video = document.createElement('div');
        video.className = 'artplayer';
        popupItem.appendChild(video);
        playArtplayer(filePath);
    } else if (filePath.endsWith('.mp3') || filePath.endsWith('.ogg')) {
        const audio = document.createElement('audio');
        audio.src = `/media/${filePath}`;
        audio.controls = true;
        popupItem.appendChild(audio);
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.svg')) {
        const image = document.createElement('img');
        image.src = `/media/${filePath}`;
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
    mediaDownloadName = '';
    mediaDownloadPath = '';
}

function mediaDownload() {
    //location.href = `/media/${mediaDownloadName}`;
    var downloadLink = document.createElement('a');
    downloadLink.href = `/media/${mediaDownloadPath}`;
    downloadLink.download = mediaDownloadName;
    downloadLink.click();
}

function playArtplayer(filePath) {
    let newPath = 'media\\' + filePath;
    let subGeneral = newPath.replace(/\.[^.]+$/, '.srt');
    let subEn = newPath.replace(/\.[^.]+$/, '.en.srt');
    let subTr = newPath.replace(/\.[^.]+$/, '.tr.srt');
    var art = new Artplayer({
        container: '.artplayer',
        url: newPath,
        volume: 1.0,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: true,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: false,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        theme: '#23ade5',
        settings: [
            {
                width: 200,
                html: 'Subtitle',
                tooltip: 'Bilingual',
                icon: '<img width="22" heigth="22" src="/icons/subtitle-icon.svg">',
                selector: [
                    {
                        html: 'Display',
                        tooltip: 'Show',
                        switch: true,
                        onSwitch: function (item) {
                            item.tooltip = item.switch ? 'Hide' : 'Show';
                            art.subtitle.show = !item.switch;
                            return !item.switch;
                        },
                    },
                    {
                        default: true,
                        html: 'Bilingual',
                        url: subGeneral,
                    },
                    {
                        html: 'English',
                        url: subEn,
                    },
                    {
                        html: 'Türkçe',
                        url: subTr,
                    },
                ],
                onSelect: function (item) {
                    art.subtitle.switch(item.url, {
                        name: item.html,
                    });
                    return item.html;
                },
            },
        ],
    });
}
