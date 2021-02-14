import "./SuggestionCard.css";

function Suggestion({ title, year, image, onSelect }) {
    return (
        <div
            className="suggestion-card"
            title={title}
            onClick={() => onSelect()}
        >
            <img
                src={image}
                alt=""
            />
            <div className="suggestion-card-title">
                {title}
            </div>
            <div className="suggestion-card-info">
                {year}
            </div>
        </div>
    );
}

export default Suggestion;
