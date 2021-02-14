import { useEffect, useState } from "react";
import { request, imageSpinner } from "../tools";

import "./Episodes.css";

function Episodes({ season: { season, url }, onSelect }) {
    const [loading, setLoading] = useState(true);
    const [requestError, setRequestError] = useState(false);
    const [episodes, setEpisodes] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            const { error, value } = await (async () => {
                if (!CACHE_EPISODES.has(url)) {
                    CACHE_EPISODES.set(url, await request("getSeasonEpisodes", { url }));
                }
                return CACHE_EPISODES.get(url);
            })();

            if (error) {
                setRequestError(true);
            } else {
                setEpisodes(value);
            }

            setLoading(false);
        };
        
        load();
    }, [url]);

    if (loading) {
        return (
            <div className="message-loading episode-message">
                Bezig met laden van de episodes van <b>seizoen {season}</b> ...
                <img
                    className="spinner"
                    style={{ marginTop: "24px", marginLeft: "256px" }}
                    src={imageSpinner}
                    alt=""
                />
            </div>
        );
    }

    if (requestError) {
        return (
            <div className="message-error episode-message">
                Er liep iets fout bij het laden van de episodes.
            </div>
        );
    }

    if (episodes.length === 0) {
        return (
            <div className="message-not-found episode-message">
                Dit seizoen heeft nog geen episodes.
            </div>
        );
    }

    return (
        <div>
            {episodes.map((episode) => (
                <div
                    key={episode.episode}
                    className="episode-card episode-watch"
                    title={`${episode.title} (${episode.airdate})`}
                    onClick={() => onSelect({
                        season,
                        episode: episode.episode,
                    })}
                >
                    <div className="episode-label">
                        Bekijk episode {episode.episode}:
                    </div>
                    <div className="episode-title">
                        {episode.title}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Episodes;

const CACHE_EPISODES = new Map();
