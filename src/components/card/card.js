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

const Card = ({ index, setFile, file, id, url, product_name, star_value, notes, brand, color, price, onDelete, onEdit, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState({ id, url, product_name, star_value, notes, brand, color, price });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tempImg, setTempImg] = useState(false);

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

  const refreshForm = () => {
    setFile(null)
    setTempImg(false);
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
    // Check if any required fields are empty
    const requiredFields = ['brand', 'product_name', 'color', 'price', 'notes'];
    const emptyFields = requiredFields.filter(field => !editedReview[field]);

    // If there are empty required fields, display an error message and prevent saving
    if (emptyFields.length > 0) {
      alert(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
      return;
    }

    // Pass the updated review data to the parent component
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

  const handleChangeImage = (event) => {
    const file = event.target.files[0];
    setFile(file);
    setTempImg(true);
  };



  return (
    <div className={`card ${!star_value ? 'inactive' : ''}`}>
      <div className="inner-card">
        <div className="card-content">

          <div className="uploaded-img" style={{ backgroundImage: `url(${url})` }}>
            <div className={`img ${(star_value > 2.5) ? 'good' : (!star_value ? 'question' : 'bad')}`}></div>
          </div>
          <div className="details">
            <h2 className="brand">{brand}</h2>
            <h3 className="product">{product_name}</h3>
            <div className="chips">
              <div className="chip-span">
                <p className="price chip">${price}</p>
              </div>
              <div className="chip-span">
                {/* <div className="color-circle"></div> */}
                <p className="color chip">{color}</p>
              </div>
            </div>
            <Rank rank={star_value} />
            <p className="notes">{notes}</p>
            {user && <div className="footer">
              <button className="button" onClick={handleEdit}>Edit</button>
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
              <FormControl component="fieldset">
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
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="color"
                label="Color"
                variant="outlined"
                required
                value={editedReview.color}
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
                value={editedReview.price}
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
                id="notes"
                label="Notes"
                variant="outlined"
                multiline
                required
                rows={4}
                value={editedReview.notes}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              {/* Display the uploaded image */}

              {url && !tempImg && <img className="prev-img" src={url} alt="Uploaded" />}

              <input type="file" onChange={handleChangeImage} />
            </Grid>
            <Grid item xs={12}>
              <div className="edit-modal-actions">
                <Button onClick={handleDelete}>Delete</Button>
                <div>
                  <Button onClick={handleCancelEdit}>Cancel</Button>
                  <button className="button" onClick={handleSaveEdit}>Save</button>
                </div>
              </div>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Modal open={showConfirmation} onClose={handleCancelDelete}>
        <Box sx={style}>
          <h3>Are you sure?</h3>
          <Grid item xs={12}>
            <div className="nested-modal-actions">
              <Button variant="contained" onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete}>Delete Review</Button>
            </div>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
};

export default Card;
