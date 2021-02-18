const AdmZip = require("adm-zip");
const tools = require("../tools.js");

module.exports = {
    getMovieSubtitles,
    getSeriesSubtitles,
};

const ORIGIN = Buffer.from("aHR0cHM6Ly93d3cub3BlbnN1YnRpdGxlcy5vcmc=", "base64").toString();

async function getMovieSubtitles({ title, year }) {
    const yearString = (!year || year > 2000) ? "" : "+" + year;
    const name = title.toLowerCase().replace(/ /g, "+");
    const url = ORIGIN +
        "/en/search" +
        "/sublanguageid-dut" +
        "/searchonlymovies-on" +
        `/moviename-${name}${yearString}`;

    return collectSubtitles(url);
}

async function getSeriesSubtitles({ title, season, episode }) {
    const name = title.toLowerCase().replace(/ /g, "+");
    const url = ORIGIN +
        "/en/search" +
        "/sublanguageid-dut" +
        "/searchonlytvseries-on" +
        "/season-" + season +
        "/episode-" + episode +
        `/moviename-${name}`;

    return collectSubtitles(url);
}

async function collectSubtitles(url) {
    const finalUrl = await tools.followRedirections(url);

    if (finalUrl.indexOf("/subtitles/") >= 0) {
        const downloadUrl = await fetchDownloadUrl(finalUrl);
        return fetchSrt(downloadUrl);
    } else {
        const correctUrl = await fetchDownloadPageUrl(finalUrl);
        return collectSubtitles(correctUrl);
    }
}

async function fetchDownloadUrl(url) {
    const html = await tools.getHtml(url);
    const $ = tools.cheerio.load(html);
    const a = $('a[itemprop="url"][title="Download"]').eq(0);

    if (a && a.attr("href")) {
        return tools.joinUrl(ORIGIN, a.attr("href"));
    }

    throw new Error(`couldn't fetch subtitles download url for url: ${url}`);
}

async function fetchDownloadPageUrl(url) {
    const html = await tools.getHtml(url);
    const $ = tools.cheerio.load(html);
    const a = $("a.bnone").eq(0);  // n

    if (a && a.attr("href")) {
        return tools.joinUrl(ORIGIN, a.attr("href"));
    }

    throw new Error(`couldn't fetch subtitles download page url for url: ${url}`);
}

async function fetchSrt(url) {
    const buffer = await tools.getBuffer(url);

    try {
        const zip = new AdmZip(buffer);
        const entries = zip.getEntries();

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.entryName.trim().endsWith(".srt")) {
                return entry.getData().toString("utf8");
            }
        }
    } catch (err) {
        throw new Error(`couldn't unzip subtitles file for url: ${url} (${err.message})`);
    }

    throw new Error(`couldn't find srt file in zip for url: ${url}`);
}
