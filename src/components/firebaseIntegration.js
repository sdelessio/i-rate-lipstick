import React, { useEffect, useState } from 'react';
import Card from "./card/card"
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import { FormControl, FormLabel } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import 'firebase/storage';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const FirebaseIntegration = ({ formData, setFormData, deleteReview, handleSubmitModalOpen, handleSubmitModalClose, submitModalOpen, setSubmitModalOpen, updateReview, setLipstickReviews, lipstickReviews, addReview, user }) => {



  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addReview(formData); // Call the addReview function passed from App component
      handleSubmitModalClose();
    } catch (error) {
      console.error("Error submitting review:", error.message);
    }
  };

  const handleDelete = (deletedReview) => {
    deleteReview(deletedReview)
  };

  const handleEdit = async (updatedReview) => {
    updateReview(updatedReview)
  };


  // New state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [originalData, setOriginalData] = useState(lipstickReviews);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRank, setSelectedRank] = useState(null);
  const [file, setFile] = useState(null);
  const [eatenStatus, setEatenStatus] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Filter the data based on the search query
    const filtered = originalData.filter((row) =>
      (row.brand && row.brand.toLowerCase().includes(searchQuery.toLowerCase())) || (row.product_name && row.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchQuery, originalData, lipstickReviews]);


  useEffect(() => {
    setOriginalData(lipstickReviews);
    setLoading(false);
  }, [lipstickReviews]);

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


  useEffect(() => {
    // Filter the data based on the search query, rank, and eaten status
    const filtered = originalData
      .filter((row) =>
        (row.brand && row.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.product_name && row.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .filter((row) => {
        if (selectedRank !== null) {
          if (selectedRank === "unrated") {
            return parseFloat(row.star_value) === 0;
          } else {
            const lowerBound = selectedRank - 0.5;
            const upperBound = selectedRank;
            const starRank = parseFloat(row.star_value);
            return starRank >= lowerBound && starRank <= upperBound;
          }
        }
        return true;
      });

    setFilteredData(filtered);
  }, [searchQuery, selectedRank, originalData]);



  return (
    <div className="body">
      <main>
        <Modal
          open={submitModalOpen}
          onClose={handleSubmitModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>

            <Typography id="modal-modal-title" variant="h6" component="h2">
              Submit a review
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>

              <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={1} columnSpacing={1} >
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Rating</FormLabel>
                      <Rating
                        name="rating"
                        value={formData.star_value}
                        onChange={(event, newValue) => setFormData({ ...formData, star_value: newValue })}
                        precision={0.5}
                        size="large"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      id="brand"
                      label="Brand"
                      variant="outlined"
                      value={formData.brand}
                      onChange={handleChange}
                      fullWidth
                    /></Grid>
                  <Grid item xs={7}>
                    <TextField
                      id="product_name"
                      label="Product Name"
                      variant="outlined"
                      value={formData.product_name}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      id="color"
                      label="Color"
                      variant="outlined"
                      value={formData.color}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      id="price"
                      label="Price ($)"
                      variant="outlined"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id="notes"
                      label="Notes"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={formData.notes}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item x={12}>
                  <input type="file" />
                  </Grid>
                  <Grid item xs={12}>
                    <div className="submit-modal-actions">
                      <Button onClick={handleSubmitModalClose} sx={{ mt: 2 }}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                        Submit
                      </Button>

                    </div>
                  </Grid>
                </Grid>
              </form>
            </Typography>
          </Box>
        </Modal>

        {/* <p>Reviewing the lipsticks I have so I stop buying garbage</p> */}
        <div className="search-rank-container">
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
                  }}
                />
              </label>
            ))}
          </div>
          <div className="circle-radios">
            {/* <label className="circle-radio">
              <input
                type="radio"
                name="rankFilter"
                value="unrated"
                checked={selectedRank === "unrated"}
                onChange={() => {
                  setSelectedRank("unrated");
                }}
              />
              Unrated
            </label> */}
            <label className="circle-radio">
              <input
                type="radio"
                name="rankFilter"
                value=""
                checked={!selectedRank}
                onChange={() => {
                  setSelectedRank(null);
                }}
              />
              Show All
            </label>
          </div>

        </div>
        <div className="search-container">
        <div className="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#afb4bc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" fill="none" /> {/* Set the fill to white here */}
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="search"
            label="Search reviews"
            variant="filled"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            placeholder="Search review"
          />
         
        </div>
        </div>





        {loading ? (
          <div class="lds-hourglass"></div>
        ) : (
          <pre id="content" style={{ whiteSpace: 'pre-wrap' }}>
            {filteredData.length > 0 ? (
              filteredData.map((review, index) => (
                <Card
                  key={index}
                  index={index}
                  {...review}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  user={user}
                />
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

export default FirebaseIntegration;
