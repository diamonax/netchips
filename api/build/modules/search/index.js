const tools = require("../tools.js");

module.exports = {
    getPopularMovies,
    getPopularSeries,
    searchMovie,
    searchSeries,
    getMovieInformation,
    getSeriesInformation,
    getSeasonEpisodes,
};

const ORIGIN = Buffer.from("aHR0cHM6Ly93d3cuaW1kYi5jb20=", "base64").toString();

async function getPopularMovies() {
    const url = `${ORIGIN}/chart/moviemeter/`;
    return getPopular(url);
}

async function getPopularSeries() {
    const url = `${ORIGIN}/chart/tvmeter/`;
    return getPopular(url);
}

async function getPopular(url) {
    const html = await tools.getHtml(url);
    const $ = tools.cheerio.load(html);

    const results = [];

    const table = $("tbody.lister-list").eq(0);
    $("tr", table).each((i, tr) => {
        const tds = $("td", tr);
        const td0 = tds.eq(0);
        let image = $("img", td0).eq(0).attr("src");
        if (image.indexOf("/nopicture/") >= 0) {
            return;
        }
        image = image.replace(/_U(X|Y)\d+_/g, "_UX320_");
        image = image.replace(/_CR\d+,\d+,\d+,\d+_/g, "_CR,,320,440_");

        const td1 = tds.eq(1);
        const href = $("a", td1).eq(0).attr("href");
        const url = tools.joinUrl(ORIGIN, href);
        const text = td1.text();

        const from = text.indexOf("(");
        const to = text.indexOf(")");

        let title = text;
        let year = 0;
        if (from > 0) {
            title = text.slice(0, from);
            year = parseInt(text.slice(from + 1, to).trim());
            if (isNaN(year)) {
                year = 0;
            }
        }
        if (year < 1000) {
            return;
        }
        title = title.trim();

        results.push({
            url,
            title,
            year,
            image,
        });
    });

    return results;
}

async function searchMovie({ query }) {
    return search(query, false);
}

async function searchSeries({ query }) {
    return search(query, true);
}

async function search(keyword, searchingSeries) {
    const query = encodeURIComponent(keyword.trim().toLowerCase());
    const url = `${ORIGIN}/find?q=${query}&s=tt&ttype=${searchingSeries ? "tv" : "ft"}`;
    
    const html = await tools.getHtml(url);
    const $ = tools.cheerio.load(html);

    const results = [];

    const table = $("table.findList").eq(0);
    $("tr", table).each((i, tr) => {
        const tds = $("td", tr);
        const td0 = tds.eq(0);
        let image = $("img", td0).eq(0).attr("src");
        if (image.indexOf("/nopicture/") >= 0) {
            return;
        }
        if (image === "https://m.media-amazon.com/images/S/sash/85lhIiFCmSScRzu.png") {
            // no-image image
            return;
        }
        image = image.replace(/_U(X|Y)\d+_/g, "_UX320_");
        image = image.replace(/_CR\d+,\d+,\d+,\d+_/g, "_CR,,320,440_");

        const td1 = tds.eq(1);
        const href = $("a", td1).eq(0).attr("href");
        const url = tools.joinUrl(ORIGIN, href);
        const text = td1.text();

        let title = text;
        if (searchingSeries && title.indexOf("Serie") < 0) {
            return;
        }
        
        const from = text.indexOf("(");
        if (from > 0) {
            title = text.slice(0, from);
        }
        
        let year = 0;
        let txt = text;
        while (true) {
            let from = txt.indexOf("(");
            let to = txt.indexOf(")");
            if (from >= 0) {
                let value = parseInt(txt.slice(from + 1, to).trim());
                if (!isNaN(value)) {
                    year = value;
                    break;
                }
                txt = txt.slice(to + 1);
            } else {
                break;
            }
        }
        if (year < 1000) {
            return;
        }
        
        title = title.trim();
        if (title.toLowerCase().indexOf(keyword.toLowerCase()) < 0) {
            return;
        }

        results.push({
            url,
            title,
            year,
            image,
        });
    });

    return results;
}

async function getMovieInformation({ url }, searchingSeries = false) {
    const html = await tools.getHtml(url);
    const $ = tools.cheerio.load(html);

    const h1 = $("h1").eq(0);
    const text = h1.text();
    const from = text.indexOf("(");
    const to = text.indexOf(")");
    let title = text;
    let year = 0;
    if (from > 0) {
        title = text.slice(0, from);
        year = parseInt(text.slice(from + 1, to).trim());
        if (isNaN(year)) {
            year = 0;
        }
    }
    title = title.trim();

    if (searchingSeries && year === 0) {
        const divSubtext = $("div.subtext").eq(0);
        let anchorDate = null;
        $("a", divSubtext).each((i, a) => {
            const title = $(a).attr("title");
            if (title && title.includes("release date")) {
                anchorDate = a;
            }
        });
        if (anchorDate) {
            const text = $(anchorDate).text();
            const from = text.indexOf("(");
            const to = text.indexOf(")");
            if (from >= 0) {
                const s = text.slice(from + 1, to);
                const v = parseInt(s);
                if (!isNaN(v)) {
                    year = v;
                } else {
                    const w = parseInt(s.split("-")[0]);
                    if (!isNaN(w)) {
                        year = w;
                    }
                }
            }
        }
    }

    const image = $("div.poster img").eq(0).attr("src")
        .replace(/_U(X|Y)\d+_/g, "_UX320_")
        .replace(/_CR\d+,\d+,\d+,\d+_/g, "_CR,,320,440_");

    const ratingText = $("span[itemprop='ratingValue']").eq(0).text().replace(/,/g, ".").trim();
    let rating = parseFloat(ratingText);
    if (isNaN(rating)) {
        rating = 0;
    }

    const durationText = $("time").eq(1).text().replace("min", "").trim();
    let duration = parseInt(durationText);
    if (isNaN(duration)) {
        duration = 0;
    }

    const genres = [];
    $(".subtext a").each((i, a) => {
        const href = $(a).attr("href");
        if (href.indexOf("genre") >= 0) {
            const genre = $(a).text().toLowerCase().trim();
            genres.push(genre);
        }
    });

    const description = $("div.summary_text").eq(0).text().trim();
    // const cover = $("div.slate img").eq(0).attr("src");

    return {
        title,
        year,
        description,
        image,
        rating,
        duration,
        genres,
    };
}

async function getSeriesInformation({ url }) {
    const results = await getMovieInformation({ url }, true);

    results.seasons = [];
    const episodesUrl = tools.joinUrl(url, "episodes");

    const html = await tools.getHtml(episodesUrl);
    const $ = tools.cheerio.load(html);

    const select = $("#bySeason").eq(0);
    $("option", select).each((i, option) => {
        const season = parseInt($(option).text().trim());
        if (isNaN(season)) {
            return;
        }

        const url = `${episodesUrl}?season=${season}`;

        results.seasons.push({
            season,
            url,
        });
    });

    return results;
}

async function getSeasonEpisodes({ url }) {
    const html = await tools.getHtml(url);

    const episodes = [];
    const $ = tools.cheerio.load(html);

    $("div.list_item").each((i, div) => {
        const info = $("div.info", div).eq(0);
        const title = $("a", info).eq(0).text().trim();
        const description = $("div.item_description", info).eq(0).text().trim();
        const airdate = $("div.airdate", info).eq(0).text().trim();
        const image = $("img", div).eq(0).attr("src");
        const rating = $("div.ipl-rating-widget", div).eq(0);
        if (!rating.length) {
            return; // did not air yet
        }

        episodes.push({
            episode: episodes.length + 1,
            title,
            description,
            airdate,
            image,
        });
    });

    return episodes;
}
