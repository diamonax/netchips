const _ = require("lodash");
const tools = require("../tools.js");

module.exports = {
    getMovieTorrents,
    getSeriesTorrents,
};

const MOVIES_ORIGIN = Buffer.from("aHR0cHM6Ly95dHMubXg=", "base64").toString();
const SERIES_ORIGIN = Buffer.from("aHR0cHM6Ly90di12Mi5hcGktZmV0Y2guc2g=", "base64").toString();

async function getMovieTorrents({ title, year }) {
    const query = encodeURIComponent(tools.normalizeTitle(title));
    const url = `${MOVIES_ORIGIN}/api/v2/list_movies.json?query_term=${query}`;

    const data = await tools.getJson(url);
    if (!data) return null;

    const entry = data.data?.movies?.find((x) => tools.windowRange(year, x.year, 1));
    const torrents = entry?.torrents ?? data.data?.movies?.[0]?.torrents;
    
    if (!torrents || torrents.length === 0) {
        return null;
    }

    const ts =  torrents.filter((x) => ["480p", "720p", "1080p"].includes(x.quality));

    // group by quality and keep those that have most peers
    return Object.values(_.mapValues(_.groupBy(ts.filter((x) => x), "quality"), (group) => {
        return group.sort((a, b) => b.peers - a.peers)[0];
    }));
}

async function getSeriesTorrents({ title, season, episode }) {
    const query = encodeURIComponent(tools.normalizeTitle(title));
    let url = `${SERIES_ORIGIN}/shows/1?keywords=${query}`;

    let data = await tools.getJson(url);
    if (!data || data.length === 0) return null;

    const _id = data[0]._id;
    url = `${SERIES_ORIGIN}/show/${_id}`;

    data = await tools.getJson(url);
    if (!data) return null;

    const torrents = data.episodes
        ?.find((x) => x.season === season && x.episode === episode)
        ?.torrents;

    if (!torrents || Object.keys(torrents).length === 0) {
        return null;
    }

    const ts = Object.entries(_.pick(torrents, ["480p", "720p", "1080p"])).map((x) => {
        return { quality: x[0], url: x[1].url };
    });
    
    return ts;
}
