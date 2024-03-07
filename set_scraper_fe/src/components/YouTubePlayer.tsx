import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Load the YouTube IFrame API script
declare global {
    interface Window {
      onYouTubeIframeAPIReady: () => void;
      YT: any;
    }
  }


  

const YouTubePlayer = forwardRef((props:any, ref) => {
  // const playerInstanceRef = useRef();/

  // Use `useImperativeHandle` to expose any function to the parent component
  useImperativeHandle(ref, () => ({
    seekSeconds(timeChange) {
      if (playerInstanceRef.current) {
        // Assuming you have a way to access the current time of the player
        const currentTime = playerInstanceRef.current.getCurrentTime();
        const newTime = currentTime +timeChange;
        playerInstanceRef.current.seekTo(newTime);
      }
    },
    
  }));




  const playerRef = useRef(null); // DOM element ref
  const playerInstanceRef = useRef(null); // YouTube player instance ref


const updateCurrentTime = () => {
  const player = playerInstanceRef.current;
  if (player && player.getPlayerState() === window.YT.PlayerState.PLAYING) {
    const time = player.getCurrentTime();

    props.updateCurrentTime(time); // Assuming you have a prop function to update the time
  }
};



  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: props.videoId,
        width: '100%',
        events: {
          onReady: (event) => {

            setInterval(updateCurrentTime, 5000); // Poll every second while playing
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              updateCurrentTime(); // Update currentTime on play
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              updateCurrentTime(); // Update currentTime on pause/end
            }
            if (event.data === window.YT.PlayerState.PLAYING) {
              props.addId();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              props.handlePlayNext();
            }
          },
        },
      });
    };
  
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else if (!playerInstanceRef.current) {
      onYouTubeIframeAPIReady();
    } else {
      playerInstanceRef.current.loadVideoById(props.videoId);
    }
  }, [props.videoId]);

  // Separate useEffect for handling side effects related to props.songVideos changes
useEffect(() => {


}, [props.songVideos, props.channelVideos]); 

  return <div ref={playerRef} style={{ width: '100%' }} />;
});

export default YouTubePlayer;



            // if (playerStatus == -1) {
            //     color = "#37474F"; // unstarted = gray
            //   } else if (playerStatus == 0) {
            //     color = "#FFFF00"; // ended = yellow
            //   } else if (playerStatus == 1) {
            //     color = "#33691E"; // playing = green
            //   } else if (playerStatus == 2) {
            //     color = "#DD2C00"; // paused = red
            //   } else if (playerStatus == 3) {
            //     color = "#AA00FF"; // buffering = purple
            //   } else if (playerStatus == 5) {
            //     color = "#FF6DOO"; // video cued = orange
            //   }