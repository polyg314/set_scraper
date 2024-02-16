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
      // Define the player
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: props.videoId,
        width: '100%',
        height: '250px', // Example height, consider dynamically calculating this based on the aspect ratio
        events: {
          onReady: (event) => {
            console.log('YouTube Player is ready');
          },
          onStateChange: (event) => {
            console.log(event)
            if(event.data === 1){
                // console.log(props.currentlyPlayingType)
                props.addId()
                // if(props.currentlyPlayingType === "SETS"){
                //     console.log('adding set id')
                //     props.addSetId(props.videoId)
                // }else if(props.currentlyPlayingType === "SONGS"){
                //     console.log('adding song id')
                //     props.addSongId(props.videoId)
                // }
            //   console.log('video playing')
            //   props.addVideoId(props.videoId)
            }
            else if (event.data == 0) {
                props.handlePlayNext()
                // color = "#FFFF00"; // ended = yellow

            } 
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
            // props.addVideoId(videoId)
          }
          // You can handle other events here
        },
      });
    };

    if (!window.YT) { // If the YouTube IFrame API is not loaded yet
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else if (!playerInstanceRef.current) {
      // If the API is loaded but the player instance is not created
      onYouTubeIframeAPIReady();
    } else {
      // If the player instance exists and the videoId changes
      playerInstanceRef.current.loadVideoById(props.videoId);
    }
  }, [props.videoId, props.songVideos, props.channelVideos]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, []);

  return <div ref={playerRef} style={{ width: '100%' }} />;
};

export default YouTubePlayer;
