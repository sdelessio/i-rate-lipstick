import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'; // Update import to include addDoc
import FirebaseIntegration from "./components/firebaseIntegration";
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Button from '@mui/material/Button';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';


const firebaseConfig = {
  apiKey: "AIzaSyBR-hfXKQoP8FirEec-b86LBgmKz9l2fhI",
  authDomain: "i-rate-lipstick.firebaseapp.com",
  projectId: "i-rate-lipstick",
  storageBucket: "i-rate-lipstick.appspot.com",
  messagingSenderId: "1009580701691",
  appId: "1:1009580701691:web:a5333e7ef37bbc17fc3d5e",
  measurementId: "G-3F1HLV0T6Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error.message);
  }
};

const App = () => {
  const [lipstickReviews, setLipstickReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    product_name: '',
    notes: '',
    price: '',
    color: '',
    star_value: 0,
    id: '',
    url: '',
    hex: '',
  });

  const resetFormData =() => {
    setFormData({
      brand: '',
      product_name: '',
      notes: '',
      price: '',
      color: '',
      star_value: 0,
      id: '',
      url: '',
      hex: '',
    });
  }

  const handleSubmitModalOpen = () => {
    setSubmitModalOpen(true);};
  const handleSubmitModalClose = () => {
    resetFormData();
    setSubmitModalOpen(false);
  };

  const userMenuOpen = Boolean(anchorEl);

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    setAnchorEl(null);
    auth.signOut()
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);


  

  useEffect(() => {
    const fetchReviews = async () => {
      if (user) {
        const reviewsCollection = collection(db, 'lipstick_reviews');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());
        setLipstickReviews(reviewsData);
      }
    };

    fetchReviews();
  }, [user]);

  const addReview = async (reviewData) => {
    try {
      const reviewsCollectionRef = collection(db, 'lipstick_reviews');
      const docRef = await addDoc(reviewsCollectionRef, { ...reviewData, id: null }); // Pass reviewData along with id: null
      const docId = docRef.id;
      console.log("Review added successfully with ID:", docId);
      await updateDoc(docRef, { id: docId }); // Update the document with the actual id
      setLipstickReviews([...lipstickReviews, { ...reviewData, id: docId }]); // Update the state with the new review including the id
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };
  
  


  const updateReview = async (updatedReview) => {
    try {
      const reviewDocRef = doc(db, "lipstick_reviews", updatedReview.id);
      await updateDoc(reviewDocRef, updatedReview);
      console.log("Review updated successfully");

      // Update the local state with the updated review
      setLipstickReviews(prevReviews => {
        const updatedReviews = prevReviews.map(review => {
          if (review.id === updatedReview.id) {
            return { ...review, ...updatedReview };
          }
          return review;
        });
        resetFormData();
        return updatedReviews;
      });
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const deleteReview = async (deletedReview) => {
    console.log(deletedReview)
    try {
      const deleteDocRed = doc(db, "lipstick_reviews", deletedReview.id);
      await deleteDoc(deleteDocRed);
      setLipstickReviews(lipstickReviews.filter(review => review.id !== deletedReview.id));
      resetFormData();
    } catch (error) {
      console.error("Error deleting review:", error);
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



  return (
    <div className="app">
      <header>

        <h1>I rate Lipstick</h1>
        <div className="header-inner">
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
              placeholder="Search review"
            />

          </div>
          </div>


        {user ? (
          <>
            <Button
              id="user-menu-button"
              aria-controls={userMenuOpen ? 'user-menu-button' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
              onClick={handleUserMenuClick}
            >
              {user.displayName}
            </Button>
            <Menu
              id="user-menu"
              aria-labelledby="user-menu"
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleSubmitModalOpen}>Submit a reivew</MenuItem>
              <MenuItem onClick={handleSignOut}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="contained" onClick={signInWithGoogle}>Sign in with Google</Button>
        )}
                  </div>
      </header>

      <FirebaseIntegration selectedRank={selectedRank}searchQuery={searchQuery} formData={formData} setFormData={setFormData} deleteReview={deleteReview} handleSubmitModalClose={handleSubmitModalClose} handleSubmitModalOpen={handleSubmitModalOpen} submitModalOpen={submitModalOpen} setSubmitModalOpen={setSubmitModalOpen} user={user} updateReview={updateReview} addReview={addReview} lipstickReviews={lipstickReviews} setLipstickReviews={setLipstickReviews} />
      {user &&
        <div className="submit-button-container">
          <Tooltip title="Submit a review">
          <button onClick={handleSubmitModalOpen} className="submit-button" aria-label="delete">
            <AddIcon />
          </button>
          </Tooltip>
        </div>
      }
    </div>

  )
};

export default App;
