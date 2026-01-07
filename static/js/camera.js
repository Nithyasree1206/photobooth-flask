const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");
const flash = document.getElementById("flash");
const shutter = document.getElementById("shutter");

let currentFilter = "none";
let stripPhotos = [];

/* CAMERA */
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => video.srcObject = stream)
.catch(err => alert("Camera error: " + err));

function setFilter(filter) {
    currentFilter = filter;
    video.style.filter = filter;
}

/* COUNTDOWN */
function startCountdown(callback) {
    let count = 3;
    countdown.style.display = "block";
    countdown.innerText = count;

    const timer = setInterval(() => {
        count--;
        if (count === 0) {
            clearInterval(timer);
            countdown.style.display = "none";
            flashEffect();
            callback();
        } else {
            countdown.innerText = count;
        }
    }, 1000);
}

/* FLASH */
function flashEffect() {
    flash.style.opacity = 1;
    shutter.play();
    setTimeout(() => flash.style.opacity = 0, 200);
}

/* CAPTURE */
function capture() {
    startCountdown(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = currentFilter;
        ctx.drawImage(video, 0, 0);
        ctx.filter = "none";
        savePhoto();
    });
}

/* SAVE */
function savePhoto() {
    fetch("/save_photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: canvas.toDataURL() })
    });
}

/* STRIP */
function startStrip() {
    stripPhotos = [];
    let count = 0;

    const interval = setInterval(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = currentFilter;
        ctx.drawImage(video, 0, 0);
        stripPhotos.push(canvas.toDataURL());
        count++;

        if (count === 4) {
            clearInterval(interval);
            createStrip();
        }
    }, 1500);
}

function createStrip() {
    const stripCanvas = document.createElement("canvas");
    const stripCtx = stripCanvas.getContext("2d");

    stripCanvas.width = canvas.width;
    stripCanvas.height = canvas.height * 4;

    let y = 0;
    stripPhotos.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            stripCtx.drawImage(img, 0, y);
            y += canvas.height;
        };
    });

    setTimeout(() => {
        canvas.width = stripCanvas.width;
        canvas.height = stripCanvas.height;
        ctx.drawImage(stripCanvas, 0, 0);
    }, 500);
}

/* DOWNLOAD */
function download() {
    const link = document.createElement("a");
    link.download = "photobooth.png";
    link.href = canvas.toDataURL();
    link.click();
}

/* PRINT */
function printPhoto() {
    const w = window.open("");
    w.document.write(`<img src="${canvas.toDataURL()}" style="width:100%">`);
    w.print();
}
