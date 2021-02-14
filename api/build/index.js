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

// 404 instead everywhere?

function requestHandler(request, response) {
    console.log(request.method, request.url);
    response.setHeader("access-control-allow-origin", "*");
    
    if (request.method === "POST") {
        const chunks = [];
        
        request.on("data", (chunk) => {
            chunks.push(chunk);
        });
        
        request.on("end", async () => {
            const identifier = request.url.slice(1);

            if (!Object.keys(endpoints).includes(identifier)) { // e.g. to exclude "__proto__"
                response.writeHead(400);
                response.end("invalid endpoint");
                return;
            }

            const handler = endpoints[identifier];
            if (!handler) {
                response.writeHead(400);
                response.end("invalid endpoint");
                return;
            }
            
            try {
                const buffer = Buffer.concat(chunks);
                const data = JSON.parse(buffer.toString());
                const result = await handler(data);
                if (result) {
                    response.writeHead(200, { "content-type": "application/json" });
                    response.end(JSON.stringify(result));
                } else {
                    response.writeHead(400);
                    response.end("result is null");
                }
            } catch (err) {
                console.log("Handler error:", err);
                response.writeHead(400);
                response.end("error invoking endpoint handler");
            }
        });
        
        request.on("error", () => {
            response.writeHead(500);
            response.end("error code 500");
        });
    } else {
        response.writeHead(405);
        response.end("error code 405");
    }
}
