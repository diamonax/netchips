import { useEffect, useState } from "react";
import { request, imageSpinner } from "../tools";
import SuggestionCard from "./SuggestionCard";

import "./Suggestions.css";

function Suggestions({ type, query, onSelect }) {
    const [loading, setLoading] = useState(true);
    const [requestError, setRequestError] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            const { error, value } = await (async () => {
                if (query) {
                    return type === "movies"
                        ? await request("searchMovie", { query })
                        : await request("searchSeries", { query });
                }
                if (type === "movies") {
                    if (!CACHE_POPULAR_MOVIES || CACHE_POPULAR_MOVIES.length === 0) {
                        CACHE_POPULAR_MOVIES = await request("getPopularMovies");
                    }
                    return CACHE_POPULAR_MOVIES;
                } else {
                    if (!CACHE_POPULAR_SERIES || CACHE_POPULAR_SERIES.length === 0) {
                        CACHE_POPULAR_SERIES = await request("getPopularSeries");
                    }
                    return CACHE_POPULAR_SERIES;
                }
            })();

            if (error) {
                setRequestError(true);
            } else {
                setSuggestions(value);
            }

            setLoading(false);
        };

        load();
    }, [type, query]);

    if (loading) {
        return (
            <div className="message-loading">
                Bezig met zoeken naar suggesties voor {query ? (
                    <b>{query}</b>
                ) : (
                    type === "movies" ? "populaire films" : "populaire series"
                )} ...
                <img
                    className="spinner"
                    src={imageSpinner}
                    alt=""
                />
            </div>
        );
    }

    if (requestError) {
        return (
            <div className="message-error">
                Er liep iets fout bij het laden van de suggesties.
            </div>
        );
    }

    if (suggestions.length === 0) {
        return (
            <div className="message-not-found">
                Kan geen suggesties vinden voor de zoekopdracht.
            </div>
        );
    }

    return (
        <div>
            {suggestions.map((suggestion, index) => (
                <SuggestionCard
                    key={index}
                    title={suggestion.title}
                    year={suggestion.year}
                    image={suggestion.image}
                    onSelect={() => onSelect(suggestion)}
                />
            ))}
        </div>
    );
}

export default Suggestions;

let CACHE_POPULAR_MOVIES = null;
let CACHE_POPULAR_SERIES = null;
