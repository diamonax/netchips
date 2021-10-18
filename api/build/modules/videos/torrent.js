const _ = require("lodash");
const torrentSearchApi = require("torrent-search-api");
const tools = require("../tools.js");

module.exports = {
    getMovieTorrents,
    getSeriesTorrents,
};

async function getMovieTorrents({ title, year }) {
    title = tools.normalizeTitle(title);
    const query = title;
    
    torrentSearchApi.enablePublicProviders();
    torrentSearchApi.disableProvider("Torrent9");

    const torrents = (await Promise.all(["Video", "Movies"].map(async (x) => {
        return await torrentSearchApi.search(query, x, 1);
    }))).flat();

    const torrent = torrents.sort((a, b) => (b.seeds + b.peers) - (a.seeds + a.peers))[0];
    const magnet = await torrentSearchApi.getMagnet(torrent);
    
    return [{
        quality: "1080p",
        url: magnet,
    }];
}

async function getSeriesTorrents({ title, season, episode }) {
    title = tools.normalizeTitle(title);
    const query = `${title} S${season < 10 ? "0" : ""}${season}E${episode < 10 ? "0" : ""}${episode}`;

    torrentSearchApi.enablePublicProviders();
    torrentSearchApi.disableProvider("Torrent9");

    const torrents = (await Promise.all(["Video", "Movies", "TV"].map(async (x) => {
        return await torrentSearchApi.search(query, x, 1);
    }))).flat();

    const torrent = torrents.sort((a, b) => (b.seeds + b.peers) - (a.seeds + a.peers))[0];
    const magnet = await torrentSearchApi.getMagnet(torrent);
    
    return [{
        quality: "1080p",
        url: magnet,
    }];
}

const MOVIES_ORIGIN = Buffer.from("aHR0cHM6Ly95dHMubXg=", "base64").toString();
const SERIES_ORIGIN = Buffer.from("aHR0cHM6Ly90di12Mi5hcGktZmV0Y2guc2g=", "base64").toString();

async function getMovieTorrents2({ title, year }) {
    const query = encodeURIComponent(tools.normalizeTitle(title));
    const url = `${MOVIES_ORIGIN}/api/v2/list_movies.json?query_term=${query}`;

    const data = await tools.getJson(url);

    const entry = data.data?.movies?.find((x) => tools.windowRange(year, x.year, 1))
        // ?? data.data?.movies?.find((x) => tools.areTitlesEqual(title, x.title))
        // ?? data.data?.movies?.[0];

    const torrents = entry?.torrents;
    
    if (!torrents) {
        throw new Error(`no 'torrents' in fetched json for movie torrents url: ${url}`);
    }

    if (torrents.length === 0) {
        return [];
    }

    const ts = torrents.filter((x) => ["480p", "720p", "1080p"].includes(x.quality));

    // group by quality and keep those that have most peers
    return Object.values(_.groupBy(ts.filter((x) => x), "quality")).map((group) => {
        return group.sort((a, b) => b.peers - a.peers)[0];
    });
}

async function getSeriesTorrents2({ title, season, episode }) {
    const query = encodeURIComponent(tools.normalizeTitle(title));
    let url = `${SERIES_ORIGIN}/shows/1?keywords=${query}`;

    let data = await tools.getJson(url);

    if (!data.length) {
        throw new Error(`no list in fetched json for series torrents url: ${url}`);
    }

    if (data.length === 0) {
        return [];
    }

    const _id = data[0]._id;
    url = `${SERIES_ORIGIN}/show/${_id}`;

    data = await tools.getJson(url);

    const torrents = data.episodes
        ?.find((x) => x.season === season && x.episode === episode)
        ?.torrents;

    if (!torrents) {
        throw new Error(`no 'torrents' in fetched json for series torrents url: ${url}`);
    }

    if (Object.keys(torrents).length === 0) {
        return [];
    }

    const ts = Object.entries(_.pick(torrents, ["480p", "720p", "1080p"])).map((x) => {
        return { quality: x[0], url: x[1].url };
    });
    
    return ts;
}
