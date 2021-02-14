import { useEffect, useState } from "react";
import { request, translateGenre, imageSpinner } from "../tools";
import Seasons from "./Seasons";
import ProvidersOverlay from "./ProvidersOverlay";

import "./Information.css";

function Information({ type, title, url }) {
    const [loading, setLoading] = useState(true);
    const [requestError, setRequestError] = useState(false);
    const [info, setInfo] = useState(null);
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            const { error, value } = type === "movies"
                ? await request("getMovieInformation", { url })
                : await request("getSeriesInformation", { url });

            if (error) {
                setRequestError(true);
            } else {
                setInfo(value);
            }

            setLoading(false);
        };
        
        load();
    }, [type, url]);

    const renderExtraInfo = (info) => {
        const extra = type === "movies"
            ? [`${info.duration} min`]
            : [`${info.seasons.length} seizoen${info.seasons.length === 1 ? "" : "en"}`];

        const rating = parseFloat(info.rating);

        if (!isNaN(rating)) {
            const value = Math.round(rating / 2);
            const stars = "★".repeat(value) + "☆".repeat(5 - value);
            extra.push((
                <span
                    key={1}
                    title={info.rating}
                    style={{ color: "yellow" }}
                >
                    {stars}
                </span>
            ));
        }
        extra.push(info.genres.slice(0, 3).map((x) => translateGenre(x)).join(", "));
        extra.push(info.year);

        return extra.filter((x) => x).map((x) => ["  •  ", x]).flat().slice(1);
    };

    if (loading) {
        return (
            <div className="message-loading">
                Bezig met laden van de {type === "movies" ? "film" : "serie"} <b>{title}</b> ...
                <img
                    className="spinner"
                    src={imageSpinner}
                    alt=""
                />
            </div>
        );
    }

    if (requestError || info === null) {
        return (
            <div className="message-error">
                Er liep iets fout bij het laden van de {type === "movies" ? "film" : "serie"}.
            </div>
        );
    }

    return (
        <div className="info-container">
            <div className="info-header">
                <div className="info-cover">
                    <img
                        src={info.image}
                        alt=""
                    />
                </div>
                <div className="info">
                    <div className="info-title">
                        {info.title}
                    </div>
                    <div className="info-extra">
                        {renderExtraInfo(info)}
                    </div>
                    <div className="info-description">
                        {info.description}
                    </div>
                </div>
            </div>

            {type === "movies" ? (
                <div>
                    <div 
                        className="info-watch-movie"
                        onClick={() => setSelection({ ...info, type: "movies" })}
                    >
                        Bekijk <b>{info.title}</b>
                    </div>
                </div>
            ) : (
                <Seasons
                    seasons={info.seasons}
                    onEpisodeSelect={(episode) => setSelection({ ...info, ...episode, type: "series" })}
                />
            )}

            {selection && (
                <ProvidersOverlay
                    resource={selection}
                    onExit={() => setSelection(null)}
                />
            )}
        </div>
    );
}

export default Information;