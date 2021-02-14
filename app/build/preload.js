const electron = require("electron");

electron.contextBridge.exposeInMainWorld("app", {
    playVideo(type, url, metadata, subtitles = "") {
        if (typeof type !== "string") return;
        if (typeof url !== "string") return;
        if (typeof metadata !== "object") return;
        if (typeof subtitles !== "string") return;
        if (type !== "url" && type !== "torrent") return;
        if (metadata.type !== "movies" && metadata.type !== "series") return;
        if (typeof metadata.title !== "string") return;
        if (metadata.type === "series" && typeof metadata.season !== "number") return;
        if (metadata.type === "series" && typeof metadata.episode !== "number") return;

        electron.ipcRenderer.send("playVideo", { type, url, metadata, subtitles });
    },

    stopVideo() {
        electron.ipcRenderer.send("stopVideo");
    },
});
