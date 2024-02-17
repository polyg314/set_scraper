import React, { useEffect, useRef } from 'react';

// Load the YouTube IFrame API script
declare global {
    interface Window {
      onYouTubeIframeAPIReady: () => void;
      YT: any;
    }
  }

const YouTubePlayer = (props:any) => {
  const playerRef = useRef(null); // DOM element ref
  const playerInstanceRef = useRef(null); // YouTube player instance ref

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: props.videoId,
        width: '100%',
        events: {
          onReady: (event) => {
            console.log('YouTube Player is ready');
          },
          onStateChange: (event) => {
            if (event.data === 1) {
              props.addId();
            } else if (event.data === 0) {
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
  // Here you can handle what should happen when props.songVideos changes,
  // without directly affecting the YouTube player instance.
  // This is a good place to implement logic that prepares for the next video or
  // updates related UI elements based on the new list of videos.
  // Note: There's no need to interact with the YouTube player instance here.

  // Example:
  // console.log("Updated songVideos list:", props.songVideos);

}, [props.songVideos, props.channelVideos]); 

  return <div ref={playerRef} style={{ width: '100%' }} />;
};

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