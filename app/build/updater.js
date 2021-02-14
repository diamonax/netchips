const fs = require("fs");
const https = require("https");
const path = require("path");
const zlib = require("zlib");

module.exports = {
    update,
};

const ROOT_DIRECTORY = path.join(__dirname, "../..");

async function update() {
    const localVersionsFilepath = path.join(ROOT_DIRECTORY, "versions");
    
    if (!fs.existsSync(localVersionsFilepath)) {
        fs.writeFileSync(localVersionsFilepath, JSON.stringify({
            api: 0,
            app: 0,
            ui: 0,
        }));
    }

    const localVersions = JSON.parse(fs.readFileSync(localVersionsFilepath, "utf8"));
    const remoteVersions = JSON.parse(await readRemoteFile("versions"));

    const modulesToUpdate = ["api", "app", "ui"].filter((moduleName) => {
        return localVersions[moduleName] !== remoteVersions[moduleName];
    });

    if (modulesToUpdate.length === 0) {
        console.log("All modules are up-to-date");
        return;
    }

    const tree = getRemoteFileTree();
    await Promise.all(modulesToUpdate.map(async (moduleName) => {
        console.log(`Updating ${moduleName} ...`);
        await updateModule(tree, moduleName);
        console.log(`Module ${moduleName} has been successfully updated!`);
    }));

    // do this at the end to make sure the latest versions have been successfully downloaded
    fs.writeFileSync(localVersionsFilepath, JSON.stringify(remoteVersions));
}

async function updateModule(tree, moduleName) {
    const root = `${moduleName}/build`;

    const localModuleDirectory = path.join(ROOT_DIRECTORY, root);
    console.log("rmdir", localModuleDirectory);//fs.rmdirSync(localModuleDirectory, { recursive: true });

    for (let i = 0; i < tree.length; i++) {
        const { path: pathname, type } = tree[i];

        if (!path.startsWith(root)) {
            continue;
        }

        const localFullPath = path.join(ROOT_DIRECTORY, pathname);

        if (type === "tree") {
            console.log("mkdir", localFullPath);//fs.mkdirSync(localFullPath, { recursive: true });
        }
        
        if (type === "blob") {
            const remoteContents = await readRemoteFile(pathname);
            console.log("writeFile", localFullPath, remoteContents.length);//fs.writeFileSync(localFullPath, remoteContents);
        }
    }
}

async function getRemoteFileTree() {
    const url = "https://api.github.com/repos/bauwen/netchips/git/trees/latest?recursive=1";
    const json = await request(url);
    return JSON.parse(json).tree;
}

async function readRemoteFile(pathname) {
    const url = `https://raw.githubusercontent.com/bauwen/netchips4/latest/${pathname}`;
    return await request(url);
}

function request(url) {
    const options = {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US;q=0.8,en;q=0.7",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    };

    return new Promise((resolve, reject) => {
        const request = https.request(url, options, (response) => {
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
                    resolve(buffer.toString());
                });

                output.on("error", (err) => {
                    reject(err);
                });
            } else {
                reject(new Error("status code >= 300"));
            }
        });

        request.on("error", (err) => {
            reject(err);
        });

        request.end();
    });
}
