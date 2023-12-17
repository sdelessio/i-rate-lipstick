import React from 'react';
import "./rank.scss";

const Rank = ({ rank }) => {
  const maxStars = 5; // Maximum number of stars
  const fullStars = Math.floor(rank); // Get the integer part of the rank
  const hasHalfStar = rank % 1 !== 0; // Check if there is a half star

  // Create an array of stars based on the rank
  const stars = [...Array(fullStars).fill('full'), hasHalfStar ? 'half' : '', ...Array(maxStars - Math.ceil(rank)).fill('empty')];

  // Filter out empty strings from the stars array
  const filteredStars = stars.filter((type) => type !== '');

  return (
    <div className="stars">
      {filteredStars.map((type, index) => (
        <div key={index} className={`star ${type}`} />
      ))}
    </div>
  );
};

export default Rank;
