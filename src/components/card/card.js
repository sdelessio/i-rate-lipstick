import React, { useState } from 'react';
import "./card.scss";
import Rank from "../rank/rank";
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { FormControl, FormLabel } from '@mui/material';
import Rating from '@mui/material/Rating';
import Grid from '@mui/material/Grid';

const Card = ({ index, id, url, product_name, star_value, notes, brand, color, price, onDelete, onEdit, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState({ id, url, product_name, star_value, notes, brand, color, price });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(url);

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


  const handleDelete = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    setIsEditing(false);
    onDelete({ ...editedReview }, url);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Pass the updated review data to the parent component
    onEdit({ ...editedReview });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
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

  const handleUploadImage = (event) => {
    const file = event.target.files[0];
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
              <button className="edit-button" onClick={handleEdit}>Edit</button>
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
                value={editedReview.price}
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
                value={editedReview.notes}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              {/* Display the uploaded image */}
              {uploadedImage && <img className="prev-img" src={uploadedImage} alt="Uploaded" />}
              <input type="file" onChange={handleUploadImage} />
            </Grid>
            <Grid item xs={12}>
              <div className="edit-modal-actions">
                <Button onClick={handleDelete}>Delete</Button>
                <div>
                  <Button onClick={handleCancelEdit}>Cancel</Button>
                  <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
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
