import React, { useState } from 'react';
import { Grid, Select, MenuItem, IconButton, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export const ChannelsSelectWithArrows = ({ Channels, currentChannelId, handleSetChannelId }) => {
  // Assuming currentChannelId is managed outside this component and passed as a prop

  const handleArrowClick = (direction) => {
    const currentIndex = Channels.findIndex(channel => channel.channelId === currentChannelId);
    let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    // Loop around if out of bounds
    if (newIndex < 0) newIndex = Channels.length - 1;
    else if (newIndex >= Channels.length) newIndex = 0;

    handleSetChannelId(Channels[newIndex].channelId);
  };

  return (
    <Grid item container xs={12}>
      <IconButton onClick={() => handleArrowClick('left')}>
        <ArrowBackIosNewIcon />
      </IconButton>
      <Grid item style={{width: "calc(100% - 80px)"}}>
        <Select
          fullWidth
          size="small"
          variant="outlined"
          color="primary"
          value={currentChannelId}
          onChange={(e) => handleSetChannelId(e.target.value)}
          style={{ backgroundColor: "white" }}
          className="current-channel-select"
        >
          {Channels.map((channel) => (
            <MenuItem key={channel.channelId} value={channel.channelId}>
              {channel.channelName}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <IconButton onClick={() => handleArrowClick('right')}>
        <ArrowForwardIosIcon />
      </IconButton>
    </Grid>
  );
};

