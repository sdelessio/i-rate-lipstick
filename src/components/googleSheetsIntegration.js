/* global gapi */

import React, { useEffect, useState } from 'react';
import Card from "./card/card"

const GoogleSheetsIntegration = () => {
  const CLIENT_ID = "948642139963-83v0m9dup906tnvbkcksiaspmfkqt43f.apps.googleusercontent.com";
  const API_KEY = "AIzaSyA92y9J69xGZeVfPNbKu4jpub1ziHpBnyM";
  const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
  const SPREADSHEET_ID = '1N48O3Ny6rAQiTiaBYubMzip3jylc9GfIbNmehvmNkW4';
  const RANGE = 'Sheet!A2:F';

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;

  // New state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRank, setSelectedRank] = useState(null);
  const [eatenStatus, setEatenStatus] = useState(null);
  const [unratedStatus, setUnratedStatus] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.async = true;
    script1.defer = true;
    script1.onload = () => {
      gapi.load('client', initializeGapiClient);
    };
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.async = true;
    script2.defer = true;
    script2.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error !== undefined) {
            throw resp;
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
          fetchDataFromSheet();
        },
      });

      gisInited = true;
      maybeEnableButtons();
    };
    document.body.appendChild(script2);
  }, []);

  useEffect(() => {
    // Filter the data based on the search query
    const filtered = originalData.filter((row) =>
      row[0] && row[0].toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchQuery, originalData]);

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
  }

  function maybeEnableButtons() {
    if (gapiInited && gisInited) {
      document.getElementById('authorize_button').style.visibility = 'visible';
      fetchDataFromSheet();
    }
  }

  function handleAuthClick() {
    if (!tokenClient) {
      console.error('Token client is not initialized. Make sure initialization is complete.');
      return;
    }

    // Rest of the function remains unchanged
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').innerText = 'Refresh';
      fetchDataFromSheet();
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }



  const handleStarClick = (starValue) => {
    const newRank = selectedRank === starValue ? null : starValue;
    setSelectedRank(newRank);
  };

  function handleStarHover(starValue) {
    // Find the index of the hovered star
    const hoveredStarIndex = [1, 2, 3, 4, 5].indexOf(starValue);

    // Add the hovered class to the previous stars and the current hovered star
    for (let i = 0; i <= hoveredStarIndex; i++) {
      const starLabel = document.getElementById(`star-label-${i}`);
      if (starLabel) {
        starLabel.classList.add('hovered');
        starLabel.classList.remove('unhovered'); // Remove unhovered class
      }
    }

    // Add the unhovered class to the stars after the current hovered star
    for (let i = hoveredStarIndex + 1; i <= 4; i++) {
      const starLabel = document.getElementById(`star-label-${i}`);
      if (starLabel) {
        starLabel.classList.remove('hovered');
        starLabel.classList.add('unhovered'); // Add unhovered class
      }
    }
  }

  function handleStarLeave() {
    // Remove the hovered class from all stars and add unhovered class
    for (let i = 0; i <= 4; i++) {
      const starLabel = document.getElementById(`star-label-${i}`);
      if (starLabel) {
        starLabel.classList.remove('hovered');
        starLabel.classList.remove('unhovered');
      }
    }
  }


  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      document.getElementById('content').innerText = '';
      document.getElementById('authorize_button').innerText = 'Authorize';
      document.getElementById('signout_button').style.visibility = 'hidden';
    }
  }

  function compareEaten(a, b) {
    // Convert "true" and "false" strings to actual booleans
    const eatenA = a[1];
    const eatenB = b[1];

    if (eatenA === eatenB) {
      return 0;
    } else if (eatenA) {
      return -1;
    } else {
      return 1;
    }
  }


  useEffect(() => {
    // Filter the data based on the search query, rank, and eaten status
    console.log('eatenStatus');
    const filtered = originalData
      .filter((row) => row[0] && row[0].toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((row) => {
        if (selectedRank !== null) {
          const lowerBound = selectedRank - 0.5;
          const upperBound = selectedRank;
          const restaurantRank = parseFloat(row[1]);
          return restaurantRank >= lowerBound && restaurantRank <= upperBound;
        } else if (eatenStatus === 'notEaten') {
          return !row[1]
        } else if (eatenStatus === 'eaten') {
          return row[1];
        }
        return true;
      })
    // .filter((row) => {
    //   if (eatenStatus === 'eaten') {
    //     return !row[1];
    //   } else if (eatenStatus === 'notEaten') {
    //     return row[1];
    //   }
    //   return true;
    // });

    setFilteredData(filtered);
  }, [searchQuery, selectedRank, eatenStatus, originalData]);




  async function fetchDataFromSheet() {
    setLoading(true);

    let response;
    try {
      response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });
    } catch (err) {
      document.getElementById('content').innerText = err.message;
      setLoading(false);
      return;
    }

    const range = response.result;
    if (!range || !range.values || range.values.length === 0) {
      document.getElementById('content').innerText = 'Nothing here yet.';
      setLoading(false);
      return;
    }

    // Sort the data based on the eaten property
    const sortedData = [...range.values].sort(compareEaten);

    // Set the original and filtered data
    setOriginalData(sortedData);
    setFilteredData(sortedData);

    setLoading(false);
  }




  return (
    <div>
      <header>
        <button disabled id="authorize_button" onClick={handleAuthClick}>
          Authorize
        </button>
        <button disabled id="signout_button" onClick={handleSignoutClick}>
          Sign Out
        </button>
      </header>
      <main>
        <div className="hero"></div>
        <h1>I Eat CNY</h1>
        <h2>Reviewing the food in Central New York</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search restaraunts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e8e6e6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" fill="none" /> {/* Set the fill to white here */}
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>


        <div className="rank-container">
          <div className="star-radios">
            {[1, 2, 3, 4, 5].map((starValue, index) => (
              <label
                key={starValue}
                id={`star-label-${index}`}
                className={`star-label ${selectedRank >= starValue ? 'selected' : ''}`}
                onMouseEnter={() => handleStarHover(starValue)}
                onMouseLeave={handleStarLeave}
              >
                <input
                  type="radio"
                  name="rankFilter"
                  value={starValue}
                  className="star-radio"
                  checked={selectedRank === starValue}
                  onChange={() => {
                    handleStarClick(starValue);
                    setEatenStatus(null);
                  }}
                />
              </label>
            ))}
          </div>
          <div className="circle-radios">
            <label className="circle-radio">
              <input
                type="radio"
                name="rankFilter"
                value="unrated"
                checked={eatenStatus === 'notEaten'}
                onChange={() => {
                  setSelectedRank(null);
                  setEatenStatus('notEaten');
                }}
              />
              Unrated
            </label>
            <label className="circle-radio">
              <input
                type="radio"
                name="rankFilter"
                value=""
                checked={!selectedRank && !eatenStatus}
                onChange={() => {
                  setSelectedRank(null);
                  setEatenStatus(null);
                }}
              />
              Show All
            </label>
          </div>

        </div>


        {loading ? (
         <div class="lds-hourglass"></div>
        ) : (
          <pre id="content" style={{ whiteSpace: 'pre-wrap' }}>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <Card key={index} name={row[0]} rank={row[1]} notes={row[2]} closed={row[3]} type={row[4]} address={row[5]} />
              ))
            ) : (
              <p className="no-results">No results</p>
            )}
          </pre>
        )}
      </main>
    </div>

  );
};

export default GoogleSheetsIntegration;
