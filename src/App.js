/* global gapi */

import React, { useEffect, useState } from 'react';
import GoogleSheetsIntegration from "./components/googleSheetsIntegration"

const App = () => {

  return (
    <div className="app">
      <GoogleSheetsIntegration />
    </div>
  );
};

export default App;
