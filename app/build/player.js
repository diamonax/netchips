const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const vlcCommand = require("vlc-command");

module.exports = {
    playVideo,
    stopVideo,
};

const DIRECTORY_SUBTITLES = path.join(__dirname, "../ondertitels");

let currentVlcProcess = null;
let currentTorrentProcess = null;

function getSubtitlesFilename({ type, title, season, episode }) {
    const sanitizedTitle = Array.from(title.trim().toLowerCase())
        .map((c) => c.codePointAt(0))
        .filter((c) => c === 32 || (48 <= c && c <= 57) || (97 <= c && c <= 122))
        .map((c) => String.fromCharCode(c))
        .map((c) => c === " " ? "_" : c)
        .join("");

    if (sanitizedTitle.length === 0) {
        return "";
    }

    const filename = type === "movies" 
        ? `${sanitizedTitle}.srt`
        : `${sanitizedTitle}_S${season}E${episode}.srt`;

    return path.join(DIRECTORY_SUBTITLES, filename);    
}

function writeSubtitlesToFile(filename, subtitles) {
    if (!fs.existsSync(DIRECTORY_SUBTITLES)) {
        fs.mkdirSync(DIRECTORY_SUBTITLES);
    }
    fs.writeFileSync(filename, subtitles);
}

function startVlc(url, subtitlesFilename) {
    vlcCommand((err, command) => {
        if (err) {
            console.log("VLC is not installed.");
            return;
        }

        const args = [url, "--play-and-exit", "--quiet"];

        if (process.platform === "win32") {
            if (subtitlesFilename) {
                args.push(`--sub-file=${subtitlesFilename}`);
            }
            const child = child_process.execFile(command, args, (err) => {});
            child.on("error", (err) => {});
            // child.unref();
            currentVlcProcess = child;
        } else {
            if (subtitlesFilename) {
                args.push(`--sub-file="${subtitlesFilename}"`);
            }
            const fullCommand = `${command} "${args[0]}" ${args.slice(1).join(" ")}`;
            const child = child_process.exec(fullCommand, (err) => {});
            child.on("error", (err) => {});
            // child.unref();
            currentVlcProcess = child;
        }
    });
}

function startWebtorrent(url, subtitlesFilename) {
    const cmdFile = require.resolve("webtorrent-cli/bin/cmd.js");
    const args = ["download", url, "--vlc", "--subtitles", subtitlesFilename, "--not-on-top"];
    
    const child = child_process.fork(cmdFile, args);
    child.on("error", (err) => {
        console.log("Webtorrent error:", err);
    });

    currentTorrentProcess = child;
}

function playVideo(type, url, metadata, subtitles) {
    if (currentVlcProcess || currentTorrentProcess) return;

    const subtitlesFilename = subtitles ? getSubtitlesFilename(metadata) : "";

    if (subtitlesFilename) {
        writeSubtitlesToFile(subtitlesFilename, subtitles);
    }

    if (type === "url") {
        startVlc(url, subtitlesFilename);
    } else {
        startWebtorrent(url, subtitlesFilename);
    }
}

function stopVideo() {
    if (currentVlcProcess) {
        try {
            currentVlcProcess.kill("SIGTERM");
        } catch (err) {
            // ignore
        }
        console.log("killed vlc process");
        currentVlcProcess = null;
    }

    if (currentTorrentProcess) {
        try {
            currentTorrentProcess.kill("SIGINT");
        } catch (err) {
            // ignore
        }
        console.log("killed torrent process");
        currentTorrentProcess = null;
    }
}
