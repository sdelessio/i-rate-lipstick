import React, { useEffect, useState } from 'react';
import "./card.scss";
import Rank from "../rank/rank";
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { FormControl, FormLabel } from '@mui/material';
import Rating from '@mui/material/Rating';
import Grid from '@mui/material/Grid';
import { CirclePicker } from 'react-color';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Card = ({ link, fileName, setFileName, index, hex, lipstickColors, setFile, dateAdded, file, id, url, product_name, star_value, notes, brand, color, price, onDelete, onEdit, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState({ id, url, product_name, star_value, notes, brand, color, price });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tempImg, setTempImg] = useState(false);
  const [readableDate, setReadableDate] = useState("");

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

  useEffect(() => {
    // Convert timestamp to a readable date format
    if (dateAdded) {
      const timestampInSeconds = dateAdded.seconds;
      const milliseconds = timestampInSeconds * 1000;
      const dateObject = new Date(milliseconds);
      const formattedDate = dateObject.toLocaleDateString(); // Only date, no time
      setReadableDate(formattedDate);
    }
  }, [dateAdded]);


  const refreshForm = () => {
    setFile(null)
    setTempImg(false);
    setFileName(null);
  }

  const handleDelete = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    setIsEditing(false);
    refreshForm();

    onDelete({ ...editedReview }, url);
  };

  const handleCancelDelete = () => {
    refreshForm();
    setShowConfirmation(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === '-') {
      if (event.target.value.includes('-') || event.target.selectionStart !== 0) {
        event.preventDefault();
      }
    }
  };



  const handleSaveEdit = () => {
    onEdit({ ...editedReview }, url);
    setIsEditing(false);
    refreshForm();
  };


  const handleCancelEdit = () => {
    refreshForm();
    setIsEditing(false);
    // Reset editedReview state to original values
    setEditedReview({ id, url, product_name, star_value, notes, brand, color, price });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditedReview((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleColorChange = (color) => {
    // Update formData with the new hex value
    setEditedReview((prevState) => ({
      ...prevState,
      hex: color.hex,
    }));
  };


  const handleChangeImage = (event) => {
    const file = event.target.files[0];
    setFileName(file.name)
    setFile(file);
    setTempImg(true);
  };



  return (
    <div className={`card ${!star_value ? 'inactive' : ''}`}>
      <div className="inner-card">
        <div className="card-content">
          {link !== '' ? (
            <a className="uploaded-img" href={link} target="_blank" rel="noreferrer nofollow"  style={{ backgroundImage: `url(${url})` }}></a>
          ) : (
            <div className="uploaded-img" style={{ backgroundImage: `url(${url})` }}></div>
          )}

          <div className="details">
            <div className="name-date-wrapper">
            <h2 className="brand">{brand}</h2>
            <h4 className="date-added">{readableDate}</h4>
            </div>
            <h3 className="product">{product_name}</h3>
            <div className="chips">

              <div className="color-span">
              <div className="color-circle" style={{ backgroundColor: hex, border: hex === '#FFFFFF' ? '1px solid #333333' : 'none' }}></div>
                <p>{color}</p>
              </div>
              <div className="chip-span">
                <p className="price chip">${price}</p>
              </div>
            </div>
            <Rank rank={star_value} />
            <p className="notes">{notes}</p>
            {user && user.email === 'sara.delessio@gmail.com' && <div className="footer">
              <button className="button primary" onClick={handleEdit}>Edit</button>
            </div>}
          </div>

        </div>


      </div>

      {/* Render modal for editing */}
      <Modal open={isEditing} onClose={handleCancelEdit}>
        <Box sx={style}>
          <Grid container rowSpacing={1} columnSpacing={1} >
            <h3>Edit Review</h3>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel component="legend">Rating</FormLabel>
                <Rating
                  name="rating"
                  value={editedReview.star_value}
                  onChange={(event, newValue) => setEditedReview({ ...editedReview, star_value: newValue })}
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
                value={editedReview.brand}
                onChange={handleChange}
                fullWidth
                error={editedReview.brand === ""}
                helperText={editedReview.brand === "" ? "This field is required" : ""}
                FormHelperTextProps={{ sx: { ml: 0 } }}
              />
            </Grid>
            <Grid item xs={7}>
              <TextField
                id="product_name"
                label="Product"
                variant="outlined"
                required
                value={editedReview.product_name}
                onChange={handleChange}
                fullWidth
                error={editedReview.product_name === ""}
                helperText={editedReview.product_name === "" ? "This field is required" : ""}
                FormHelperTextProps={{ sx: { ml: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="color"
                label="Color name"
                variant="outlined"
                required
                value={editedReview.color}
                onChange={handleChange}
                fullWidth
                error={editedReview.color === ""}
                helperText={editedReview.color === "" ? "This field is required" : ""}
                FormHelperTextProps={{ sx: { ml: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="price"
                label="Price ($)"
                variant="outlined"
                type="number"
                required
                value={editedReview.price}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{ inputProps: { min: 0 } }}
                onKeyDown={handleKeyDown}
                fullWidth
                error={editedReview.price === ""}
                helperText={editedReview.price === "" ? "This field is required" : ""}
                FormHelperTextProps={{ sx: { ml: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="link"
                label="Link (optional)"
                variant="outlined"
                value={editedReview.link}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <div className="color-picker">
                <label>Pick the closest color</label>
                <CirclePicker color={editedReview.hex} width={"100%"} colors={lipstickColors} onChange={handleColorChange} />
              </div>
              {/* <SliderPicker pointer={"cursor"}/> */}
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="notes"
                label="Notes"
                variant="outlined"
                multiline
                required
                rows={4}
                value={editedReview.notes}
                onChange={handleChange}
                fullWidth
                error={editedReview.notes === ""}
                helperText={editedReview.notes === "" ? "This field is required" : ""}
                FormHelperTextProps={{ sx: { ml: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              {/* Display the uploaded image */}

              <div className="edit-file-input">
                {url && !tempImg && <img className="prev-img" src={url} alt="Uploaded" />}
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
                    accept=".jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={handleChangeImage}
                  />
                </label>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="edit-modal-actions">
                <button className="button secondary" onClick={handleDelete}>Delete</button>
                <div>
                  <button className="button secondary" onClick={handleCancelEdit}>Cancel</button>
                  <button className="button primary" onClick={handleSaveEdit}>Save</button>
                </div>
              </div>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Modal open={showConfirmation} onClose={handleCancelDelete}>
        <Box sx={style}>
          <h3 >Are you sure?</h3>
          <p >This action cannot be undone.</p>
          <Grid item xs={12}>
            <div className="nested-modal-actions">
              <button className="button secondary" onClick={handleCancelDelete}>Cancel</button>
              <button className="button primary" onClick={handleConfirmDelete}>Delete Review</button>
            </div>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
};

export default Card;
