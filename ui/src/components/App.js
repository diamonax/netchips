import { useState } from "react";
import Header from "./Header";
import Information from "./Information";
import Suggestions from "./Suggestions";

import "./App.css";

function App() {
    const [type, setType] = useState("movies");
    const [query, setQuery] = useState("");
    const [selection, setSelection] = useState(null);

    const search = (type, query) => {
        setType(type);
        setQuery(query);
        setSelection(null);
    };

    return (
        <div>
            <Header
                onSearch={(type, query) => search(type, query)}
            />

            {selection ? (
                <Information
                    type={type}
                    title={selection.title}
                    url={selection.url}
                />
            ) : (
                <Suggestions
                    type={type}
                    query={query}
                    onSelect={(suggestion) => setSelection(suggestion)}
                />
            )}
        </div>
    );
}

export default App;
