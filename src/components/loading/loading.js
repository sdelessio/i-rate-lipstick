import React, { useEffect, useState } from 'react';
import "./loading.scss";

const Loading = () => {




  return (
    <div className="loading-container">
    <div className="lds-hourglass"></div>
    <p>Loading...</p>
    </div>
  );
};

export default Loading;
