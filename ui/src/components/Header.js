import { useState } from "react";
import { imageLogo } from "../tools";

import "./Header.css";

function Header({ onSearch }) {
    const [type, setType] = useState("movies");
    const [query, setQuery] = useState("");

    const handleTypeSelect = (type) => {
        setType(type);
        onSearch(type, "");
    };

    const handleSearch = () => {
        if (query.trim().length === 0) return;
        onSearch(type, query.trim());
    };
    
    return (
        <div className="header-container">
            <div className="header-title">
                <img
                    className="image-logo"
                    src={imageLogo}
                    alt=""
                />
                Netchips
            </div>
            <div className="header-type-container">
                <div 
                    className="header-type-label"
                    onClick={() => handleTypeSelect("movies")}
                >
                    Films <input
                        type="radio"
                        name="type"
                        checked={type === "movies"}
                        onChange={() => handleTypeSelect("movies")}
                    />
                </div>
                &nbsp;&nbsp;&nbsp;
                <div 
                    className="header-type-label"
                    onClick={() => handleTypeSelect("series")}
                >
                    <input
                        type="radio"
                        name="type"
                        checked={type === "series"}
                        onChange={() => handleTypeSelect("series")}
                        spellCheck={false}
                    /> Series
                </div>
            </div>
            <div>
                <input
                    className="header-search-input"
                    type="text"
                    size="36"
                    placeholder="Zoeken..."
                    value={query}
                    onInput={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") handleSearch(); }}
                />
                {/* <button
                    className="header-search-button"
                    onClick={handleSearch}
                >
                    Zoek
                </button> */}
            </div>
        </div>
    );
};

export default Header;
