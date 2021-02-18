const search = require("./modules/search");
const subtitles = require("./modules/subtitles");
const videos = require("./modules/videos");

const tests = {
    "search: fetching popular movies": async () => {
        const result = await search.getPopularMovies();
        return result.length > 10;
    },

    "search: fetching popular series": async () => {
        const result = await search.getPopularSeries();
        return result.length > 10;
    },

    "search: searching a movie": async () => {
        const result = await search.searchMovie({ query: "the matrix" });
        return result.length > 2;
    },

    "search: searching a series": async () => {
        const result = await search.searchSeries({ query: "arrow" });
        return result.length > 5;
    },

    "search: fetching movie information (Inception)": async () => {
        const result = await search.getMovieInformation({
            url: "https://www.imdb.com/title/tt1375666/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=ea4e08e1-c8a3-47b5-ac3a-75026647c16e&pf_rd_r=K7T8HNDMKNCQQTJWBBMT&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=moviemeter&ref_=chtmvm_tt_99",
        });
        return result.title === "Inception" && result.year === 2010
            && Object.values(result).every((x) => x === 0 || x);
    },

    "search: fetching series information (Homeland)": async () => {
        const result = await search.getSeriesInformation({
            url: "https://www.imdb.com/title/tt1796960/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=332cb927-0342-42b3-815c-f9124e84021d&pf_rd_r=AZ6P5Y9CGPD8NNS19ZXA&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=tvmeter&ref_=chttvm_tt_91",
        });
        return result.title === "Homeland" && result.seasons.length >= 8
            && Object.values(result).every((x) => x === 0 || x) && result.year === 2011;
    },

    "search: fetching season episodes (The Mandalorian season 2)": async () => {
        const result = await search.getSeasonEpisodes({
            url: "https://www.imdb.com/title/tt8111088/episodes?season=2",
        });
        return result.length === 8 && result[0].episode === 1
            && result[0].title === "Chapter 9: The Marshal";
    },

    "subtitles: fetching movie subtitles": async () => {
        const result = await subtitles.getMovieSubtitles({
            title: "the gentlemen",
            year: 2019,
        });
        return result.length > 0;
    },

    "subtitles: fetching series subtitles": async () => {
        const result = await subtitles.getSeriesSubtitles({
            title: "game of thrones",
            season: 3,
            episode: 7,
        });
        return result.length > 0;
    },

    "videos: fetching movie URL providers (The Wolf of Wall Street)": async () => {
        const result = await videos.getMovieUrls({
            title: "the wolf of wall street",
            year: 2013,
        });
        return result.length > 1;
    },

    "videos: fetching movie torrent providers (The Wolf of Wall Street)": async () => {
        const result = await videos.getMovieTorrents({
            title: "the wolf of wall street",
            year: 2013,
        });
        return result.length > 1;
    },

    "videos: fetching movie URL providers (The Green Butchers)": async () => {
        const result = await videos.getMovieUrls({
            title: "the green butchers",
            year: 2003,
        });
        return result.length > 0;
    },

    "videos: fetching movie torrent providers (The Green Butchers)": async () => {
        const result = await videos.getMovieTorrents({
            title: "the green butchers",
            year: 2003,
        });
        return result.length > 1;
    },

    "videos: fetching series URL providers (Westworld S02E05)": async () => {
        const result = await videos.getSeriesUrls({
            title: "westworld",
            year: 2018,
            season: 2,
            episode: 5,
        });
        return result.length > 0;
    },

    "videos: fetching series torrent providers (Westworld S02E05)": async () => {
        const result = await videos.getSeriesTorrents({
            title: "westworld",
            year: 2018,
            season: 2,
            episode: 5,
        });
        return result.length > 0;
    },
};

async function main() {
    const entries = Object.entries(tests).sort(([a], [b]) => a.localeCompare(b));
    let successCount = 0;
    console.log(`\n>>> Starting ${entries.length} tests...\n`);

    for (let [description, testFunction] of entries) {
        console.log(description);
        console.log("-".repeat(description.length));
        try {
            const success = await testFunction();
            if (!success) throw new Error("expected true, but got false");
            console.log("SUCCESS\n");
            successCount += 1;
        } catch (err) {
            console.log(`FAILURE!\nError: "${err.message}"\n`);
        }
    }

    if (successCount === entries.length) {
        console.log(">>> Tests done: ALL TESTS PASSED!");
    } else {
        const count = entries.length - successCount;
        console.log(`>>> Tests done: ${count} TEST${count === 1 ? "" : "S"} FAILED!`);
    }
}

main();
