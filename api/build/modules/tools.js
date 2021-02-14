const cheerio = require("cheerio");
const http = require("http");
const https = require("https");
const url = require("url");
const zlib = require("zlib");

module.exports = {
    cheerio,

    areTitlesEqual,
    normalizeTitle,

    windowRange,
    pullString,
    joinUrl,

    getBuffer,
    getHtml,
    getJson,
    followRedirections,
};

function areTitlesEqual(title1, title2) {
    return normalizeTitle(title1) === normalizeTitle(title2);
}

function normalizeTitle(title) {
    return title
        .trim()
        .toLowerCase()
        .replace(/(\.|,|'|:|;|!|\?|-|\+|( +))/g, " ")
        .trim()
        .split(" ")
        .filter((x) => x)
        .join(" ");
}

function windowRange(center, x, radius) {
    if (center === undefined || x === undefined) return false;
    return Math.abs(center - x) <= radius;
}

function pullString(text, position, quote) {
    let result = "";

    for (let i = position; i >= 0; i--) {
        const c = text.charAt(i);
        if (c === quote) {
            break;
        }
        result = c + result;
    }

    for (let i = position + 1; i < text.length; i++) {
        const c = text.charAt(i);
        if (c === quote) {
            break;
        }
        result += c;
    }

    return result;
}

function joinUrl(base, rel) {
    return url.resolve(base, rel);
}

async function getBuffer(link, headers = {}) {
    const { error, buffer } = await request(link, {
        method: "GET",
        headers,
    });
    if (error || !buffer || buffer.length === 0) {
        return null;
    }
    return buffer;
}

async function getHtml(link, headers = {}) {
    const buffer = await getBuffer(link, headers);
    if (!buffer) {
        return "";
    }
    const html = buffer.toString();
    return html;
}

async function getJson(link, headers = {}) {
    const buffer = await getBuffer(link, headers);
    if (!buffer) {
        return null;
    }
    try {
        const json = buffer.toString();
        const data = JSON.parse(json);
        return data;
    } catch (err) {
        return null;
    }
}

async function followRedirections(link, depth = 0) {
    if (depth > 5) {
        return "";
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(link);
    } catch (err) {
        return "";
    }

    const protocol = parsedUrl.protocol;
    const httplib = protocol === "http:" ? http : https;

    return new Promise((resolve) => {
        const req = httplib.request(link, {
            method: "HEAD",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
                "Connection": "close",
                "Referer": link,
                "Origin": parsedUrl.origin,
            }
        }, (response) => {
            const code = response.statusCode;

            if (300 <= code && code <= 400) {
                const location = response.headers["location"];
                const newUrl = url.resolve(link, location);

                setTimeout(() => {
                    followRedirections(newUrl, depth + 1).then(resolve);
                }, 0);
            } else {
                resolve(link);
            }
        });

        req.on("error", () => {
            resolve("");
        });

        req.end();
    });
}

async function request(link, options, depth = 0) {
    if (depth > 3) {
        return { error: new Error("depth exceeded") };
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(link);
    } catch (err) {
        return { error: new Error("invalid request URL") };
    }

    const completeOptions = {
        method: options.method,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US;q=0.8,en;q=0.7",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Referer": link,
            "Origin": parsedUrl.origin,
            ...options.headers,
        }
    };

    const protocol = parsedUrl.protocol;
    const httplib = protocol === "http:" ? http : https;

    return new Promise((resolve) => {
        const req = httplib.request(link, completeOptions, (response) => {
            const code = response.statusCode;

            if (200 <= code && code < 300) {
                let output = response;

                switch (response.headers["content-encoding"]) {
                    case "gzip":
                        output = response.pipe(zlib.createGunzip());
                        break;

                    case "deflate":
                        output = response.pipe(zlib.createInflate());
                        break;

                    case "br":
                        output = response.pipe(zlib.createBrotliDecompress());
                        break;
                }

                const chunks = [];

                output.on("data", (data) => {
                    chunks.push(data);
                });

                output.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    const headers = response.headers;
                    resolve({ buffer, headers });
                });

                output.on("error", (err) => {
                    resolve({ error: err });
                });
            }
            else if (300 <= code && code < 400) {
                const location = response.headers["location"];
                const newLink = url.resolve(link, location);
                setTimeout(() => {
                    request(newLink, options, depth + 1).then(resolve);
                }, 0);
            }
            else {
                resolve({ error: new Error("http error code") });
            }
        });

        req.on("error", (err) => {
            if (depth === 0) {
                setTimeout(() => {
                    request(link, options, depth + 1).then(resolve);
                }, 500);
            } else {
                resolve({ error: err });
            }
        });

        if (options.method === "POST" && options.body) {
            req.write(options.body);
        }

        req.end();
    });
}
