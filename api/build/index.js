const fs = require("fs");
const http = require("http");
const path = require("path");

const endpoints = {
    ...require("./modules/search"),
    ...require("./modules/subtitles"),
    ...require("./modules/videos"),
};

module.exports = {
    startServer,
};

function startServer(port) {
    return new Promise((resolve) => {
        const server = http.createServer();

        server.on("request", requestHandler);

        server.listen(port, () => {
            console.log(`Server is listening on port ${server.address().port}`);
            resolve(server.address().port);
        });
    });
}

function requestHandler(request, response) {
    console.log(request.method, request.url);
    response.writeHead(200, {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
    });
    
    if (request.method === "POST") {
        const chunks = [];
        
        request.on("data", (chunk) => {
            chunks.push(chunk);
        });
        
        request.on("end", async () => {
            const identifier = request.url.slice(1);

            if (!Object.keys(endpoints).includes(identifier)) { // e.g. to exclude "__proto__"
                response.end(JSON.stringify({ error: "invalid endpoint" }));
                return;
            }

            const handler = endpoints[identifier];
            const buffer = Buffer.concat(chunks);

            let data;
            try {
                data = JSON.parse(buffer.toString());
            } catch (err) {
                response.end(JSON.stringify({ error: "invalid input data" }));
                return;
            }

            try {
                const result = await handler(data);
                response.writeHead(200, { "content-type": "application/json" });
                response.end(JSON.stringify({ value: result }));
            } catch (err) {
                console.log("API Error:", err);
                response.writeHead(200, { "content-type": "application/json" });
                response.end(JSON.stringify({ error: err.message }));
            }
        });
        
        request.on("error", () => {
            response.end(JSON.stringify({ error: "request error" }));
        });
    } else {
        response.end(JSON.stringify({ error: "invalid http method" }));
    }
}
