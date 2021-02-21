const API_ORIGIN = (() => {
    let origin = window.location.origin;
    if (!origin || origin.startsWith("file://")) {
        origin = window.location.hash?.slice(1) ?? "";
    }
    return origin;
})();

export async function request(endpoint, data = {}) {
    try {
        const response = await fetch(`${API_ORIGIN}/${endpoint}`, {
            method: "POST",
            headers: {
                "content-type": "text/plain", // important for no-OPTION cors
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        if (result.value === undefined) {
            throw new Error("invalid response");
        }
        
        return result;
    } catch (err) {
        console.log(`Error calling '/${endpoint}':`, err.message);
        return { error: true };
    }
}

export function translateGenre(genre) {
    const value = genre.toLowerCase();
    switch (value) {
        case "action": return "actie";
        case "adventure": return "avontuur";
        case "animation": return "animatie";
        case "biography": return "biografie";
        case "comedy": return "komedie";
        case "crime": return "misdaad";
        case "documentary": return "documentaire";
        case "drama": return "drama";
        case "family": return "familie";
        case "fantasy": return "fantasie";
        case "history": return "geschiedenis";
        case "horror": return "horror";
        case "musical": return "musical";
        case "mystery": return "mysterie";
        case "romance": return "romantiek";
        case "sci-fi":
        case "science fiction": return "sciencefiction";
        case "thriller": return "thriller";
        default: return value;
    }
}

export const DESKTOP_APP = !!window.app;

export function playVideo(type, url, metadata, subtitles) {
    if (!DESKTOP_APP) return;
    window.app.playVideo(type, url, metadata, subtitles);
}

export function stopVideo() {
    if (!DESKTOP_APP) return;
    window.app.stopVideo();
}

export const imageLogo = "data:image/png;base64,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";

export const imageSpinner = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDApIG5vbmUgcmVwZWF0IHNjcm9sbCAwJSAwJTsgZGlzcGxheTogYmxvY2s7IHNoYXBlLXJlbmRlcmluZzogYXV0bzsiIHdpZHRoPSIxMDRweCIgaGVpZ2h0PSIxMDRweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KPGNpcmNsZSBjeD0iODQiIGN5PSI1MCIgcj0iMTAiIGZpbGw9IiNlMmUyZTIiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMC40NzE2OTgxMTMyMDc1NDcxcyIgY2FsY01vZGU9InNwbGluZSIga2V5VGltZXM9IjA7MSIgdmFsdWVzPSIxMDswIiBrZXlTcGxpbmVzPSIwIDAuNSAwLjUgMSIgYmVnaW49IjBzIj48L2FuaW1hdGU+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJmaWxsIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjg4Njc5MjQ1MjgzMDE4ODVzIiBjYWxjTW9kZT0iZGlzY3JldGUiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgdmFsdWVzPSIjZTJlMmUyOyNlMmUyZTI7I2UyZTJlMjsjZWY2YTU2OyNlMmUyZTIiIGJlZ2luPSIwcyI+PC9hbmltYXRlPgo8L2NpcmNsZT48Y2lyY2xlIGN4PSIxNiIgY3k9IjUwIiByPSIxMCIgZmlsbD0iI2UyZTJlMiI+CiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMS44ODY3OTI0NTI4MzAxODg1cyIgY2FsY01vZGU9InNwbGluZSIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiB2YWx1ZXM9IjA7MDsxMDsxMDsxMCIga2V5U3BsaW5lcz0iMCAwLjUgMC41IDE7MCAwLjUgMC41IDE7MCAwLjUgMC41IDE7MCAwLjUgMC41IDEiIGJlZ2luPSIwcyI+PC9hbmltYXRlPgogIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjg4Njc5MjQ1MjgzMDE4ODVzIiBjYWxjTW9kZT0ic3BsaW5lIiBrZXlUaW1lcz0iMDswLjI1OzAuNTswLjc1OzEiIHZhbHVlcz0iMTY7MTY7MTY7NTA7ODQiIGtleVNwbGluZXM9IjAgMC41IDAuNSAxOzAgMC41IDAuNSAxOzAgMC41IDAuNSAxOzAgMC41IDAuNSAxIiBiZWdpbj0iMHMiPjwvYW5pbWF0ZT4KPC9jaXJjbGU+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMTAiIGZpbGw9IiNlZjZhNTYiPgogIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InIiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBkdXI9IjEuODg2NzkyNDUyODMwMTg4NXMiIGNhbGNNb2RlPSJzcGxpbmUiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgdmFsdWVzPSIwOzA7MTA7MTA7MTAiIGtleVNwbGluZXM9IjAgMC41IDAuNSAxOzAgMC41IDAuNSAxOzAgMC41IDAuNSAxOzAgMC41IDAuNSAxIiBiZWdpbj0iLTAuNDcxNjk4MTEzMjA3NTQ3MXMiPjwvYW5pbWF0ZT4KICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJjeCIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMS44ODY3OTI0NTI4MzAxODg1cyIgY2FsY01vZGU9InNwbGluZSIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiB2YWx1ZXM9IjE2OzE2OzE2OzUwOzg0IiBrZXlTcGxpbmVzPSIwIDAuNSAwLjUgMTswIDAuNSAwLjUgMTswIDAuNSAwLjUgMTswIDAuNSAwLjUgMSIgYmVnaW49Ii0wLjQ3MTY5ODExMzIwNzU0NzFzIj48L2FuaW1hdGU+CjwvY2lyY2xlPjxjaXJjbGUgY3g9Ijg0IiBjeT0iNTAiIHI9IjEwIiBmaWxsPSIjZTJlMmUyIj4KICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJyIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjg4Njc5MjQ1MjgzMDE4ODVzIiBjYWxjTW9kZT0ic3BsaW5lIiBrZXlUaW1lcz0iMDswLjI1OzAuNTswLjc1OzEiIHZhbHVlcz0iMDswOzEwOzEwOzEwIiBrZXlTcGxpbmVzPSIwIDAuNSAwLjUgMTswIDAuNSAwLjUgMTswIDAuNSAwLjUgMTswIDAuNSAwLjUgMSIgYmVnaW49Ii0wLjk0MzM5NjIyNjQxNTA5NDJzIj48L2FuaW1hdGU+CiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3giIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBkdXI9IjEuODg2NzkyNDUyODMwMTg4NXMiIGNhbGNNb2RlPSJzcGxpbmUiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgdmFsdWVzPSIxNjsxNjsxNjs1MDs4NCIga2V5U3BsaW5lcz0iMCAwLjUgMC41IDE7MCAwLjUgMC41IDE7MCAwLjUgMC41IDE7MCAwLjUgMC41IDEiIGJlZ2luPSItMC45NDMzOTYyMjY0MTUwOTQycyI+PC9hbmltYXRlPgo8L2NpcmNsZT48Y2lyY2xlIGN4PSIxNiIgY3k9IjUwIiByPSIxMCIgZmlsbD0iI2UyZTJlMiI+CiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMS44ODY3OTI0NTI4MzAxODg1cyIgY2FsY01vZGU9InNwbGluZSIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiB2YWx1ZXM9IjA7MDsxMDsxMDsxMCIga2V5U3BsaW5lcz0iMCAwLjUgMC41IDE7MCAwLjUgMC41IDE7MCAwLjUgMC41IDE7MCAwLjUgMC41IDEiIGJlZ2luPSItMS40MTUwOTQzMzk2MjI2NDE0cyI+PC9hbmltYXRlPgogIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjg4Njc5MjQ1MjgzMDE4ODVzIiBjYWxjTW9kZT0ic3BsaW5lIiBrZXlUaW1lcz0iMDswLjI1OzAuNTswLjc1OzEiIHZhbHVlcz0iMTY7MTY7MTY7NTA7ODQiIGtleVNwbGluZXM9IjAgMC41IDAuNSAxOzAgMC41IDAuNSAxOzAgMC41IDAuNSAxOzAgMC41IDAuNSAxIiBiZWdpbj0iLTEuNDE1MDk0MzM5NjIyNjQxNHMiPjwvYW5pbWF0ZT4KPC9jaXJjbGU+CjwhLS0gW2xkaW9dIGdlbmVyYXRlZCBieSBodHRwczovL2xvYWRpbmcuaW8vIC0tPjwvc3ZnPg==";

export const imageVlc = "data:image/png;base64,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";