import { useEffect, useState } from "react";
import { request, imageVlc, imageSpinner, DESKTOP_APP, playVideo, stopVideo } from "../tools";

import "./ProvidersOverlay.css";

function ProvidersOverlay({ resource: { type, title, year, season, episode }, onExit }) {
    const [urls, setUrls] = useState(null);
    const [torrents, setTorrents] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [subtitlesCache, setSubtitlesCache] = useState("");

    useEffect(() => {
        const onUrlsLoaded = ({ value }) => {
            setUrls(value ?? []);
        };
        const onTorrentsLoaded = ({ value }) => {
            setTorrents(value ?? []);
        };
        if (type === "movies") {
            request("getMovieUrls", { title, year }).then(onUrlsLoaded);
            request("getMovieTorrents", { title, year }).then(onTorrentsLoaded);
        } else {
            request("getSeriesUrls", { title, season, episode }).then(onUrlsLoaded);
            request("getSeriesTorrents", { title, season, episode }).then(onTorrentsLoaded);
        }
    }, [type, title, year, season, episode]);

    const getSubtitlesFilename = () => {
        const sanitizedTitle = Array.from(title.trim().toLowerCase())
            .map((c) => c.codePointAt(0))
            .filter((c) => c === 32 || (48 <= c && c <= 57) || (97 <= c && c <= 122))
            .map((c) => String.fromCharCode(c))
            .map((c) => c === " " ? "_" : c)
            .join("");
    
        if (sanitizedTitle.length === 0) {
            return "";
        }
    
        if (type === "series") {
            return `${sanitizedTitle}__S${season}E${episode}.srt`;
        }
    
        return `${sanitizedTitle}.srt`;
    }

    const handleSelectVideo = async (videoType, url) => {
        setPlaying(true);

        let subtitles = subtitlesCache;
        if (!subtitles) {
            const { error, value } = type === "movies"
                ? await request("getMovieSubtitles", { title, year })
                : await request("getSeriesSubtitles", { title, season, episode });
            subtitles = error ? "" : value;
            if (subtitles) setSubtitlesCache(subtitles);
        }

        if (DESKTOP_APP) {
            playVideo(videoType, url, { type, title, season, episode }, subtitles);
        } else if (subtitles) {
            const blob = new Blob([subtitles], { type: "text/plain" });
            const a = document.createElement("a");
            a.setAttribute("download", getSubtitlesFilename());
            a.href = window.URL.createObjectURL(blob);
            setTimeout(() => a.click(), 100);
        }
    };

    const handleGoBack = () => {
        setPlaying(false);
        stopVideo();
    };

    const handleExit = () => {
        handleGoBack();
        onExit();
    };

    const getUrlType = (url) => {
        const extension = url.slice(url.lastIndexOf(".") + 1);
        return extension === "mp4" ? "mp4" : "stream";
    };

    const getSeasonEpisodeLabel = (season, episode) => {
        return `S${season < 10 ? "0" : ""}${season}E${episode < 10 ? "0" : ""}${episode}`;
    };

    const renderContent = () => {
        if (
            (urls === null && torrents === null) ||
            (urls === null && torrents?.length === 0) ||
            (urls?.length === 0 && torrents === null)
        ) {
            return (
                <div className="overlay-loading">
                    {/* Zoeken naar video's voor <b>{title}{type === "movies" ? "" : ` (S${season}E${episode})`}</b> ... */}
                    Aan het zoeken naar video's voor de {type === "movies" ? "film" : "episode"} ...
                </div>
            );
        }
    
        if (urls?.length === 0 && torrents?.length === 0) {
            return (
                <div className="overlay-error">
                    Geen video's gevonden voor <b>{title} ({getSeasonEpisodeLabel(season, episode)})</b>
                </div>
            );
        }

        if (playing && DESKTOP_APP) {
            return (
                <div align="center">
                    <div className="overlay-row" style={{ fontSize: "24px" }}>
                        <img
                            src={imageVlc}
                            alt=""
                            style={{ verticalAlign: "text-top" }}
                        />
                        &nbsp;&nbsp;&nbsp;
                        <b>De video wordt geopend in VLC. Even geduld...</b>
                    </div>
                    {/* <div className="overlay-row" style={{ fontSize: "14px", color: "rgb(200, 200, 200)" }}>
                        <i>Wees er zeker van dat VLC op je computer is geïnstalleerd indien er niets gebeurt.</i>
                    </div> */}
                    <div className="overlay-row" style={{ marginTop: "36px", marginBottom: "4px" }}>
                        Nederlandstalige ondertitels worden automatisch gezocht.
                    </div>
                    <div className="overlay-row" style={{ marginTop: "0px" }}>
                        Verschuif de ondertitels met de <b>G</b> en <b>H</b> toetsen indien nodig.
                    </div>
                    <div className="overlay-row" style={{ marginTop: "42px" }}>
                        <button
                            className="overlay-button"
                            onClick={() => handleGoBack()}
                        >
                            Ga terug naar lijst van gevonden video's
                        </button>
                    </div>
                </div>
            );
        }

        if (playing && !DESKTOP_APP) {
            return (
                <div align="center">
                    <div className="overlay-row" style={{ fontSize: "24px" }}>
                        <b>De ondertitels worden gezocht. Even geduld...</b>
                    </div>
                    <div className="overlay-row" style={{ fontSize: "16px", marginTop: "48px" }}>
                        Het bestand zal automatisch worden gedownload.
                    </div>
                    <div className="overlay-row" style={{ fontSize: "16px",  marginTop: "0px" }}>
                        Indien dit niet gebeurt, zijn er geen nederlandstalige ondertitels gevonden.
                    </div>
                    <div className="overlay-row" style={{ marginTop: "48px" }}>
                        <button
                            className="overlay-button"
                            onClick={() => handleGoBack()}
                        >
                            Ga terug naar lijst van gevonden video's
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {/* <div className="overlay-row" style={{ fontSize: "22px" }}>
                    Video's voor <b>{title}{type === "movies" ? "" : ` (S${season}E${episode})`}</b>:
                    <br /><br />
                </div> */}
                {urls === null ? (
                    <div className="overlay-row" style={{ color: "rgb(120, 120, 120)" }} align="center">
                        {/* <i>Aan het zoeken naar URL's ...</i> */}
                        <img
                            className="overlay-spinner overlay-spinner-top"
                            src={imageSpinner}
                            alt=""
                        />
                    </div>
                ) : urls?.sort((a, b) => getUrlType(a).localeCompare(getUrlType(b))).map((url, index) => (
                    <div
                        key={index}
                        className="overlay-row"
                    >
                        <div className="overlay-label">
                            URL ({getUrlType(url)})
                        </div>
                        <input
                            className="overlay-input"
                            type="text"
                            value={url}
                            onClick={(event) => event.target.select()}
                            readOnly
                        />
                        <button
                            className="overlay-button"
                            onClick={() => handleSelectVideo("url", url)}
                        >
                            {DESKTOP_APP ? "Open met VLC" : "Download ondertitels"}
                        </button>
                    </div>
                ))}

                {torrents === null ? (
                    <div className="overlay-row" style={{ color: "rgb(120, 120, 120)" }} align="center">
                        {/* <i>Aan het zoeken naar torrents ...</i> */}
                        <img
                            className="overlay-spinner overlay-spinner-bottom"
                            src={imageSpinner}
                            alt=""
                        />
                    </div>
                ) : torrents?.map((torrent, index) => (
                    <div
                        key={index}
                        className="overlay-row"
                    >
                        <div className="overlay-label">
                            Torrent ({torrent.quality})
                        </div>
                        <input
                            className="overlay-input"
                            type="text"
                            value={torrent.url}
                            onClick={(event) => event.target.select()}
                            readOnly
                        />
                        <button
                            className="overlay-button"
                            onClick={() => handleSelectVideo("torrent", torrent.url)}
                        >
                            {DESKTOP_APP ? "Open met VLC" : "Download ondertitels"}
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            className="overlay"
            onClick={() => handleExit()}
        >
            <div
                className="overlay-container"
                onClick={(event) => event.stopPropagation()}
            >
                {renderContent()}
            </div>
        </div>
    );
}

export default ProvidersOverlay;
