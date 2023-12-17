import React from 'react';
import "./card.scss";
import Rank from "../rank/rank";

const Card = ({ name, notes, rank, closed, type }) => {
    return (
        <div className={`card ${!rank || closed === "TRUE" ? 'inactive' : ''}`}>
            <h2>{name}
                {closed === "TRUE" && (
                    <span> (Closed)</span>
                )}
            </h2>
            <p className="type">{type}</p>
            <div className={`img ${closed === "TRUE" ? "closed" : (closed === "FALSE" && rank > 2.5) ? 'good' : (!rank ? 'question' : 'bad')}`}></div>
            <p>{notes}</p>
            <Rank rank={rank} />
            {/* <p>{rank} Stars</p> */}
        </div>
    );
};

export default Card;