import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  zIndex: 10000,
  maxHeight: '80vh !important',
  overflow: 'scroll'
}

const AboutModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {/* Close button at the top right */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography id="modal-modal-title" variant="h6" component="h2">
          About <b className='yellow-text'>The Download</b>
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {/* Your "About This App" information goes here */}
          This app is designed as an interface to easily listen to sets from some the best online radio stations, and to allow you to pull, listen to, and like songs from those sets. To do so: 
          <ol>
            <li>Choose a station from the dropdown</li>
            <li>Choose a set from the dropdown</li>
            <li>Listen to set, or skim through set via fast-forward and rewind buttons</li>
            <li>Click the "Add (+) Songs" button to scrape the Youtube page for the identified track and add the songs to your song queue</li>
            <li>Go through your song queue when you have songs queued up. When you find a song you like, you can click "Like" button to like the song on your Youtube profile</li>
            
        </ol>
        <i>Please note - you must be logged in to have songs added to your Youtube account. As app is currently in "testing" mode, please reach out to paulgaudin314@gmail.com if you are looking for Google permissions to do so! </i>

        </Typography>
      </Box>
    </Modal>
  );
};

export default AboutModal;
