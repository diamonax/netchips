const electron = require("electron");
const path = require("path");
const vlcCommand = require("vlc-command");

const updater = require("./updater");
const player = require("./player");
const api = require("../../api/build");

electron.app.on("window-all-closed", () => {
    electron.app.quit();
    electron.app.exit(0);
    process.exit();
});

electron.app.on("ready", async () => {
    try {
        await updater.update();
    } catch (err) {
        // ignore: just open current
        // version if update fails
        console.log("Update error:", err);
    }

    vlcCommand((err, command) => {
        if (err || !command) {
            showVlcNotFoundPopup();
            return;
        }
        startApp();
    });
});

function showVlcNotFoundPopup() {
    const window = new electron.BrowserWindow({
        title: "Netchips - VLC is niet geïnstalleerd",
        width: 1080,
        height: 640,
        minWidth: 1080,
        minHeight: 640,
        useContentSize: true,
        resizable: false,
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    window.loadURL(`file:///${path.join(__dirname, "vlc_not_found.html")}`);
    window.setMenu(null);

    window.once("ready-to-show", () => {
        window.show();
    });
}

async function startApp() {
    const port = await api.startServer(0);

    const window = new electron.BrowserWindow({
        title: "Netchips",
        width: 1080,
        height: 680,
        minWidth: 1080,
        minHeight: 680,
        useContentSize: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false,
            preload: path.join(electron.app.getAppPath(), "build/preload.js"),
        },
    });

    const localHtmlFile = path.join(__dirname, "../../ui/build/index.html");
    const serverOrigin = `http://localhost:${port}`;
    
    window.loadURL(`file:///${localHtmlFile}#${serverOrigin}`);
    window.setMenu(null);
    window.openDevTools();

    window.once("ready-to-show", () => {
        window.show();
    });
};

electron.ipcMain.on("playVideo", (event, { type, url, metadata, subtitles }) => {
    player.playVideo(type, url, metadata, subtitles);
});

electron.ipcMain.on("stopVideo", (event) => {
    player.stopVideo();
});
