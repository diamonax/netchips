import { useState } from "react";
import Episodes from "./Episodes";

import "./Seasons.css";

function Seasons({ seasons, onEpisodeSelect }) {
    const [selectedSeason, setSelectedSeason] = useState(seasons[0]);

    if (seasons.length === 0) {
        return (
            <div className="message-not-found">
                Deze serie heeft (nog) geen seizoenen.
            </div>
        );
    }

    return (
        <div className="season-menu">
            <div>
                <select
                    className="season-select"
                    onChange={(event) => setSelectedSeason(seasons[event.target.selectedIndex])}
                >
                    {seasons.map((season) => (
                        <option key={season.season}>
                            Seizoen {season.season}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <Episodes
                    season={selectedSeason}
                    onSelect={onEpisodeSelect}
                />
            </div>
        </div>
    );
}

export default Seasons;
