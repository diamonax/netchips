const _ = require("lodash");
const tools = require("../tools.js");
const { getProviderVideo } = require("./direct_providers.js");

module.exports = {
    getMovieUrls,
    getSeriesUrls,
};

const ORIGIN = Buffer.from("aHR0cHM6Ly9hcGkuMTIzbW92aWUuc2hvdw==", "base64").toString();
const SITE_PARAM = "site=30802b";

async function search(title) {
    const query = encodeURIComponent(tools.normalizeTitle(title));
    const url = `${ORIGIN}/search?keyword=${query}&${SITE_PARAM}`;

    const data = await tools.getJson(url);
    if (data.contents?.length === 0) {
        throw new Error(`no 'contents' in fetched json for url: ${url}`);
    }

    return data.contents;
}

async function getMovieUrls({ title, year }) {
    const list = await search(title);

    const filteredList = list.map((x) => {
        const released = parseInt(x.released?.slice(0, 4));
        if (!isNaN(released) && !tools.windowRange(released, year, 1)) return null;
        const index = x.name.indexOf(" - Season ");
        if (index >= 0) return null;
        const name = x.name;
        return { name, hash: x.hash };
    }).filter((x) => x);

    const seasonHash = filteredList.find((x) => tools.areTitlesEqual(x.name, title))?.hash
        ?? filteredList.find((x) => tools.isTitleIncluded(x.name, title))?.hash;
    
    if (!seasonHash) return [];

    const seasonUrl = `${ORIGIN}/contents/episodes?hash=${seasonHash}&${SITE_PARAM}`;

    let data = await tools.getJson(seasonUrl);
    if (!data || data.episodes?.length === 0) return [];

    const episodeHash = data.episodes[0]?.episode_hash;
    if (!episodeHash) return [];

    const episodeUrl = `${ORIGIN}/episodes/embeds?hash=${episodeHash}&${SITE_PARAM}`;

    data = await tools.getJson(episodeUrl);
    if (!data || data.embeds?.length === 0) return [];

    const providers = await Promise.all(data.embeds.map(async (x) => {
        const url = `${ORIGIN}/embed?hash=${x.hash}&${SITE_PARAM}`;

        const data = await tools.getJson(url);
        if (!data || !data.url) return null;

        let response = null;
        try {
            response = await getProviderVideo({ url: data.url });
        } catch (err) {}
        if (!response) return null;

        return {
            videoUrl: response.url,
            url: data.url,
            provider: x.part_of?.toLowerCase(),
        };
    }));

    return _.uniq(providers.filter((x) => x).map((x) => x.videoUrl));
}

async function getSeriesUrls({ title, season, episode }) {
    const list = await search(title);

    const filteredList = list.map((x) => {
        const [name, seasonString] = x.name.split(" - Season ");
        if (!name || !seasonString) return null;
        const seasonNumber = parseInt(seasonString);
        if (isNaN(seasonNumber)) return null;
        return season === seasonNumber ? { name, hash: x.hash, } : null;
    }).filter((x) => x);

    const seasonHash = filteredList.find((x) => tools.areTitlesEqual(x.name, title))?.hash
        ?? filteredList.find((x) => tools.isTitleIncluded(x.name, title))?.hash;

    if (!seasonHash) return [];

    const seasonUrl = `${ORIGIN}/contents/episodes?hash=${seasonHash}&${SITE_PARAM}`;

    let data = await tools.getJson(seasonUrl);
    if (!data || data.episodes?.length === 0) return [];

    const episodeHash = data.episodes.find((x) => {
        const episodeNumber = parseInt(x.name);
        if (isNaN(episodeNumber)) return false;
        return episode === episodeNumber;
    })?.episode_hash;
    if (!episodeHash) return [];

    const episodeUrl = `${ORIGIN}/episodes/embeds?hash=${episodeHash}&${SITE_PARAM}`;
    
    data = await tools.getJson(episodeUrl);
    if (!data || data.embeds?.length === 0) return [];

    const providers = await Promise.all(data.embeds.map(async (x) => {
        const url = `${ORIGIN}/embed?hash=${x.hash}&${SITE_PARAM}`;
        
        const data = await tools.getJson(url);
        if (!data || !data.url) return null;

        let response = null;
        try {
            response = await getProviderVideo({ url: data.url });
        } catch (err) {}
        if (!response) return null;

        return {
            videoUrl: response.url,
            url: data.url,
            provider: x.part_of?.toLowerCase(),
        };
    }));

    return _.uniq(providers.filter((x) => x).map((x) => x.videoUrl));
}
