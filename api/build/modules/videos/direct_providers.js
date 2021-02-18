const tools = require("../tools.js");

module.exports = {
    getProviderVideo,
};

const scrapers = {
    "vidnext/load.php": async (url) => {
        const html = await tools.getHtml(url);

        let position = html.indexOf(".m3u8'");
        if (position < 0) {
            position = html.indexOf(".mp4'");
            if (position < 0) return null;
        }

        const videoUrl = tools.pullString(html, position, "'");
        if (!videoUrl || videoUrl.length === html.length) {
            throw new Error(`no video url found in html for url: ${url}`);
        }

        return { url: videoUrl };
    },

    "vidnext/streaming.php": async (url) => {
        const html = await tools.getHtml(url);

        const position = html.indexOf("vidnext.net/loadserver.php");
        if (position < 0) {
            throw new Error(`no 'vidnext.net/loadserver.php' found in html for url: ${url}`);
        }

        let vidnextUrl = tools.pullString(html, position, '"');
        if (!vidnextUrl || vidnextUrl.length === html.length) {
            throw new Error(`no vidnext url found in html for url: ${url}`);
        }

        if (vidnextUrl.startsWith("//")) {
            vidnextUrl = "https:" + vidnextUrl;
        }

        return scrapers["vidnext/load.php"](vidnextUrl);
    },

    "play.gocdn": async (url) => {
        const { hostname } = new URL(url);
        const hash = url.slice(url.lastIndexOf("/") + 1);
        const data = await tools.getJson(`https://${hostname}/get_stream?video_hash=${hash}`);

        const videoUrl = data.sources?.[0]?.file;
        if (!videoUrl) {
            throw new Error(`no video url found in json for url: ${url}`);
        }

        return { url: videoUrl };
    },
};

async function getProviderVideo({ url }) {
    const { hostname, pathname } = new URL(url);
    let hostnameWithoutTld = hostname.slice(0, hostname.lastIndexOf("."));

    let scraper = scrapers[hostnameWithoutTld];
    
    if (hostnameWithoutTld === "vidcloud9") {
        hostnameWithoutTld = "vidnext";
    }
    if (hostnameWithoutTld === "vidnext") {
        scraper = scrapers[hostnameWithoutTld + pathname];
    }

    return scraper ? scraper(url) : null;
}
