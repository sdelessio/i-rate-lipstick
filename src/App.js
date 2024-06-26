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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
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
  const [fileName, setFileName] = useState(null);


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
    link: '',
    dateAdded: null,
  });

  const resetFormData = () => {
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
      link: '',
      dateAdded: null,
    });
  }

  const handleSubmitModalOpen = () => {
    setSubmitModalOpen(true);
  };

  let scrollButton = document.getElementById("top-button-container");
  window.onscroll = function () { scrollFunction() };

  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      scrollButton.style.display = "block";
    } else {
      scrollButton.style.display = "none";
    }
  }

  const scrollToTop = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Operament
  }

  const handleSubmitModalClose = () => {
    setFileName(null);
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
      const reviewsCollection = collection(db, 'lipstick_reviews');
      const reviewsSnapshot = await getDocs(reviewsCollection);
      const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());
      setLipstickReviews(reviewsData);
    };

    fetchReviews();
  }, []);


  const addReview = async (reviewData) => {
    try {
      const currentDate = new Date();
      const reviewsCollectionRef = collection(db, 'lipstick_reviews');
      const docRef = await addDoc(reviewsCollectionRef, { ...reviewData, id: null, dateAdded: currentDate });
      const docId = docRef.id;
      console.log("Review added successfully with ID:", docId);
      await updateDoc(docRef, { id: docId });
      setLipstickReviews([...lipstickReviews, { ...reviewData, id: docId, dateAdded: currentDate }]);
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


  const getUserInitials = (displayName) => {
    if (!displayName) return '';

    const initials = displayName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();

    return initials;
  };





  return (
    <div className="app">
      <header>

        <div className="title-container"><div className="logo"></div><div className="title"><h1>LipOracle</h1><p>Reviewing My Lipstick Arsenal so I Stop Buying Garbage</p></div></div>
        {/* <div className="header-inner"> */}



        {user ? (
          <>
            <Button
              id="user-menu-button"
              aria-controls={userMenuOpen ? 'user-menu-button' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
              onClick={handleUserMenuClick}
              sx={{
                bgcolor: '#bf2146',
                // borderRadius: '100%',
                height: '2em',
                width: '2em',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#bf2146'
                }
              }}
            >
              {getUserInitials(user.displayName)}
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
              {user && user.email === 'sara.delessio@gmail.com' ? <MenuItem onClick={handleSubmitModalOpen}>Submit a review</MenuItem> : ''}
              <MenuItem onClick={handleSignOut}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            sx={{
              bgcolor: '#bf2146',
              '&:hover': {
                bgcolor: '#bf2146'
              }
            }}
            variant="contained"
            onClick={signInWithGoogle}
          >
            Sign in with Google
          </Button>
        )}

      </header>

      <FirebaseIntegration setFileName={setFileName} fileName={fileName} formData={formData} setFormData={setFormData} deleteReview={deleteReview} handleSubmitModalClose={handleSubmitModalClose} handleSubmitModalOpen={handleSubmitModalOpen} submitModalOpen={submitModalOpen} setSubmitModalOpen={setSubmitModalOpen} user={user} updateReview={updateReview} addReview={addReview} lipstickReviews={lipstickReviews} setLipstickReviews={setLipstickReviews} />

      <div className="top-button-container" id="top-button-container">
        <Tooltip title="Scroll to top">
          <button onClick={scrollToTop} className="top-button" id="top-button" aria-label="Scroll to top">
            <ArrowUpwardIcon />
          </button>
        </Tooltip>
      </div>
      <footer>
        <div className="title-container"><div className="logo"></div><div className="title"><h3>LipOracle</h3>
          <p>App built by Sara DeLessio in React</p>
        </div>
        </div>
      </footer>
    </div>

  )
};

export default App;