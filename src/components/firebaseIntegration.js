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
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { CirclePicker } from 'react-color';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import logo from '../assets/images/logo.png'



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '90%', // Ensure modal does not exceed 90% of viewport width
  maxHeight: '90vh', // Set maximum height to 90% of viewport height
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  overflowY: 'auto', // Set overflowY to auto to enable vertical scrolling
  p: 4,
};


const lipstickColors = [
  // Shades of Red
  "#FFA07A", // Light Salmon (Light)
  "#FF4500", // Orange Red (Medium, Bright)
  "#B22222", // Fire Brick (Dark)
  "#FF0000", // Red (Pure, Bright)
  "#8B0000", // Dark Red (Deep)
  "#c12b27", // Medium greyish red

  // Shades of Pink
  "#FFB6C1", // Light Pink (Light, Less Saturated)
  "#FFC0CB", // Pink (Bright)
  "#FF69B4", // Hot Pink (Bright)
  "#FF1493", // Deep Pink (Bright)
  "#b94561", // Medium greyish pink

  //Shades of Purple
  "#DA70D6", // Orchid (Medium)
  "#8A2BE2", // Blue Violet (Medium)
  "#9932CC", // Dark Orchid (Medium, Less Saturated)
  "#800080", // Purple (Pure)
  "#7c294a", // Medium greyish purple

  // Shades of Nude
  "#FFDAB9", // Peach Puff (Light)
  "#D2B48C", // Tan (Medium)
  "#8B4513", // Saddle Brown (Dark)
  "#772528", // Redder Nude

  // Shades of Blue
  "#ADD8E6", // Light Blue (Light, Less Saturated)
  "#4169E1", // Royal Blue (Medium)
  "#0000FF", // Blue (Pure)
  "#191970", // Midnight Blue (Dark)
  "#00008B", // Dark Blue (Deep)
  "#184662", // Grey dark blue

  // Shades of Green
  "#2E8B57", // Sea Green (Medium)
  "#006400", // Dark Green (Deep)
  "#556B2F", // Dark Olive Green (Darker)
  "#0e2c2b", // Really dark teal gree

  // Neutral Shades
  "#696969", // Dim Gray (Grey)
  "#000000", // Black
];







const FirebaseIntegration = ({ fileName, setFileName, formData, setFormData, deleteReview, handleSubmitModalOpen, handleSubmitModalClose, submitModalOpen, setSubmitModalOpen, updateReview, setLipstickReviews, lipstickReviews, addReview, user }) => {

  const storage = getStorage();
  const storageRef = ref(storage, 'gs://i-rate-lipstick.appspot.com');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
    setFile(file);
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleColorChange = (color) => {
    // Update formData with the new hex value
    setFormData({ ...formData, hex: color.hex });
  };

  const uploadImage = async () => {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `images/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Image uploaded successfully');
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };




  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true); // Set loading state to true when submitting
      if (file) {
        const imageURL = await uploadImage();
        console.log(typeof imageURL);
        const updatedFormData = { ...formData, url: imageURL };
        setFormData(updatedFormData);
        await addReview(updatedFormData);
        setFile(null);
        handleSubmitModalClose();
      } else {
        console.log('No file selected');
      }
    } catch (error) {
      console.error('Error submitting review:', error.message);
    } finally {
      setLoading(false); // Set loading state back to false after submission
    }
  };

  const handleDelete = async (deletedReview, imgUrl) => {
    try {
      setLoading(true); // Set loading state to true when deleting
      const fileRef = ref(storage, imgUrl);
      await getDownloadURL(fileRef);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('File does not exist or cannot be accessed:', error);
    } finally {
      setLoading(false); // Set loading state back to false after deletion
    }
    deleteReview(deletedReview);
  };



  const handleEdit = async (updatedReview, imgUrl) => {
    try {
      setLoading(true); // Set loading state to true when editing
      let updatedFormData;
      if (file) {
        if (updatedReview.url !== undefined && updatedReview.url !== '') {
          const fileRef = ref(storage, imgUrl);
          deleteObject(fileRef);
        }
        const imageURL = await uploadImage();
        updatedFormData = { ...updatedReview, url: imageURL };
      }
      else {
        updatedFormData = { ...updatedReview, url: imgUrl };
      }
      updateReview(updatedFormData)
      setFile(null)
    } catch (error) {
      console.error('Error editing review:', error.message);
    } finally {
      setLoading(false); // Set loading state back to false after editing
    }
  };



  // New state variables

  const [originalData, setOriginalData] = useState(lipstickReviews);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    setLoading(false);
  }, [searchQuery, originalData, lipstickReviews]);
  


  useEffect(() => {
    setLoading(true);
    setOriginalData(lipstickReviews);
  }, [lipstickReviews]);



  const handleKeyDown = (event) => {
    if (event.key === '-' && (!event.target.value || event.target.value.startsWith('-'))) {
      event.preventDefault();
    }
  };

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
                Show all reviews
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
              placeholder="Search reviews"
            />

          </div>
        </div>
        <Modal
          open={submitModalOpen}
          onClose={handleSubmitModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} >

            <Typography id="modal-modal-title" variant="h6" component="h2">
              Submit a review
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>

              <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={1} columnSpacing={1} >
                  <Grid item xs={12}>
                    <FormControl>
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
                      required
                      value={formData.brand}
                      onChange={handleChange}
                      fullWidth
                    /></Grid>
                  <Grid item xs={7}>
                    <TextField
                      id="product_name"
                      label="Product Name"
                      variant="outlined"
                      required
                      value={formData.product_name}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      id="color"
                      label="Color name"
                      variant="outlined"
                      required
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
                      required
                      value={formData.price}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{ inputProps: { min: 0 } }}
                      onKeyDown={handleKeyDown}
                      fullWidth
                    />

                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      id="link"
                      label="Link (optional)"
                      variant="outlined"
                      value={formData.link}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <div className="color-picker">
                      <label>Pick the closest color</label>
                      <CirclePicker color={formData.hex} width={"100%"} colors={lipstickColors} onChange={handleColorChange} />
                    </div>
                    {/* <SliderPicker pointer={"cursor"}/> */}
                  </Grid>
                  <Grid item xs={12}>

                    <TextField
                      id="notes"
                      label="Notes"
                      variant="outlined"
                      required
                      multiline
                      rows={4}
                      value={formData.notes}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item x={12}>
                    <Grid item xs={12}>
                      <label htmlFor="upload-button">
                        <Button
                          component="span"
                          variant="contained"
                          startIcon={<CloudUploadIcon />}
                          className="button"
                          sx={{
                            bgcolor: '#bf2146',
                            '&:hover': {
                              bgcolor: '#bf2146'
                            }
                          }}
                        >
                          {fileName ? fileName : 'Upload file'}
                        </Button>
                        <input
                          id="upload-button"
                          type="file"
                          accept=".jpg,.jpeg,.png" // Define accepted file types if needed
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </label>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <div className="submit-modal-actions">
                      <Button onClick={handleSubmitModalClose} sx={{ mt: 2 }}>
                        Cancel
                      </Button>
                      <button className="button" type="submit" sx={{ mt: 2 }}>
                        Submit
                      </button>

                    </div>
                  </Grid>
                </Grid>
              </form>
            </Typography>
          </Box>
        </Modal>



        {loading ? (
          <div className="loading-container">
          <div className="lds-hourglass"></div>
          <p>Loading...</p>
          </div>
        ) : (
          <pre id="content" style={{ whiteSpace: 'pre-wrap' }}>
            {filteredData.length > 0 ? (
              filteredData.map((review, index) => (
                <Card
                  fileName={fileName}
                  setFileName={setFileName}
                  key={index}
                  index={index}
                  {...review}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  user={user}
                  setFile={setFile}
                  file={file}
                  lipstickColors={lipstickColors}
                />
              ))
            ) : (
              <>
                <img className="no-results-logo" src={logo} />
                <p className="no-results">No results</p>
              </>
            )}
          </pre>
        )}
      </main>
    </div>

  );
};

export default FirebaseIntegration;
