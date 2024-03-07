import React, { useContext, useEffect, useRef, useState } from "react";
import {  Grid, IconButton, Typography } from "@mui/material";
import axios from 'axios';
import { Button, TextField, Tooltip } from "@material-ui/core";
import { API_URL, Channels } from "./utils/constants";
import { axiosConfig } from "./utils/constants";
import { objectCopy } from "./utils/miscFunctions";
import YouTubePlayer from "./components/YouTubePlayer";
import { UserContext } from "./hooks/userContext";
import { useSnackbar } from 'notistack';

import { ChannelsSelectWithArrows } from "./components/ChannelsSelectWithArrows";
import Login from "./components/Login";
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import InfoIcon from '@mui/icons-material/Info'; // Using InfoIcon as an example

// style imports
import "./styles/main.scss"
import "./styles/header.scss"
import "./styles/login.scss"
import "./styles/main-video.scss"
import "./styles/main-content-buttons.scss"
import "./styles/main-content-cards.scss"
import AboutModal from "./components/AboutModal";



interface Video {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
            }
            high: {
                url: string;
            }
            medium: {
                url: string;
            };
        };
    };
}



function a11yProps(index: number) {

    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export const Main = () => {



    const MAX_SETS = 300;
    const MAX_SONGS = 1000;

    const [currentlyPlayingType, setCurrentlyPlayingType] = useState('SETS')

    const { userInfo, setUserInfo } = useContext(UserContext);

    const [radioValue, setRadioValue] = React.useState('SETS');

    const childRef = useRef(null); // Initialize childRef with useRef


    const [currentTime, setCurrentTime] = useState(0); // Assuming you manage state outside or use props


    const [songVideos, setSongVideos] = useState(() => {
        // Attempt to load saved songs from local storage
        const savedSongs = localStorage.getItem('songVideos');
        console.log("SAVED SONGS")
        console.log(JSON.parse(savedSongs))
        return savedSongs ? JSON.parse(savedSongs) : [];
    });



    const [currentVideo, setCurrentVideo] = useState(null)



    const [playedSets, setPlayedSets] = useState(() => {
        const storedSets = localStorage.getItem('playedSets');

        return storedSets ? JSON.parse(storedSets) : [];
    });

    const [addedSets, setAddedSets] = useState(() => {
        const storedSets = localStorage.getItem('addedSets');

        return storedSets ? JSON.parse(storedSets) : [];
    });


    const handleRadioChange = (v) => {
        setRadioValue(v);
    };


    // Update local storage whenever playedSets changes
    useEffect(() => {
        localStorage.setItem('playedSets', JSON.stringify(playedSets));
    }, [playedSets]);

    // Update local storage whenever playedSets changes
    useEffect(() => {

        localStorage.setItem('addedSets', JSON.stringify(addedSets));
    }, [addedSets]);


    // Function to add a new set ID, ensuring the max length is not exceeded

    const currentVideoRef = useRef(currentVideo);

    useEffect(() => {
        currentVideoRef.current = currentVideo;
    }, [currentVideo]); // Update ref whenever `currentVideo` changes


    const songVideosRef = useRef(songVideos);

    useEffect(() => {
        songVideosRef.current = songVideos;
    }, [songVideos]); // Update ref whenever `currentVideo` changes



    const currentlyPlayingTypeRef = useRef(currentlyPlayingType);

    useEffect(() => {
        currentlyPlayingTypeRef.current = currentlyPlayingType;
    }, [currentlyPlayingType]);


    const addSetId = (videoId) => {

        setPlayedSets((prevPlayedSets) => {
            // Create a new array to avoid mutating the state directly
            let updatedSets = [...prevPlayedSets, videoId];
            updatedSets = Array.from(new Set(updatedSets)); // Fix: Replace 'set' with 'Set'

            if (updatedSets.length > MAX_SETS) {
                updatedSets.shift(); // Removes the first item
            }
            return updatedSets;
        });
    };



    const [likedVideos, setLikedVideos] = useState(() => {
        const storedLikes = localStorage.getItem('likedVideos');
        console.log("LIKED VIDS")
        console.log(storedLikes)
        return storedLikes ? JSON.parse(storedLikes) : [];
    });

    // Update local storage whenever likedVideos changes
    useEffect(() => {
        localStorage.setItem('likedVideos', JSON.stringify(likedVideos));

    }, [likedVideos]);

    // Function to add a new set ID, ensuring the max length is not exceeded
    const addVideoToLikes = videoId => {
        setLikedVideos((prevLikes) => {
            // Create a new array to avoid mutating the state directly
            let updatedLikes = [...prevLikes, videoId];
            updatedLikes = Array.from(new Set(updatedLikes)); // Fix: Replace 'Song' with 'Song'

            if (updatedLikes.length > MAX_SONGS) {
                updatedLikes.shift(); // Removes the first item
            }
            return updatedLikes;
        });
    };



    const [playedSongs, setPlayedSongs] = useState(() => {
        const storedSongs = localStorage.getItem('playedSongs');

        return storedSongs ? JSON.parse(storedSongs) : [];
    });

    // Update local storage whenever playedSongs changes
    useEffect(() => {
        localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
    }, [playedSongs]);

    // Function to add a new set ID, ensuring the max length is not exceeded
    const addSongId = (videoId) => {
        setPlayedSongs((prevPlayedSongs) => {
            // Create a new array to avoid mutating the state directly
            let updatedSongs = [...prevPlayedSongs, videoId];
            updatedSongs = Array.from(new Set(updatedSongs)); // Fix: Replace 'Song' with 'Song'

            if (updatedSongs.length > MAX_SONGS) {
                updatedSongs.shift(); // Removes the first item
            }
            return updatedSongs;
        });
    };

    const addId = (newId) => {

        if (currentlyPlayingTypeRef.current === "SETS") {
            addSetId(currentVideoRef.current.id.videoId)
        } else if (currentlyPlayingTypeRef.current === "SONGS") {
            addSongId(currentVideoRef.current.id.videoId)
        }
    }


    const { enqueueSnackbar } = useSnackbar();

    const [currentChannelId, setCurrentChannelId] = useState(Channels[0]["channelId"])

    const handleSetChannelId = (channelId) => {
        setCurrentChannelId(channelId)
    }

    const updateSongVideos = (newVideos) => {
        // Combine new and existing videos, ensuring uniqueness and not exceeding 200
        const allVideos = [...newVideos, ...songVideos].slice(0, 200);
        setSongVideos(allVideos);
        // Update local storage
        localStorage.setItem('songVideos', JSON.stringify(allVideos));
    };

    const scrapeSetMusic = async (videoId: string, setInfo) => {
        try {
            let res = await axios({
                url: API_URL + '/scrape_set',
                method: 'post',
                data: { videoId: videoId },
                timeout: 8000,
                headers: axiosConfig
            });
            if (res.status === 200 && res.data.video_details) {

                let videosToAdd = res.data.video_details.map(videoDetail => {
                    let id = videoDetail.id;
                    return {
                        ...videoDetail,
                        id: { videoId: id },
                        channelId: setInfo.channelId,
                        channelName: setInfo.channelName,
                        setId: setInfo.setId,
                        setName: setInfo.setName
                    };
                });

                // Filter out duplicates before adding
                videosToAdd = videosToAdd.filter(video => !songVideos.some(existingVideo => existingVideo.id.videoId === video.id.videoId));
                if (videosToAdd.length === 0) {
                    enqueueSnackbar('0 songs detected - none added to queue', { variant: 'warning' });
                } else {
                    enqueueSnackbar(String(videosToAdd.length) + ' songs added to queue', { variant: 'success' });
                    updateSongVideos(videosToAdd);
                }

            }
            return res.data;
        } catch (err) {
            console.error('There was an error!', err);
            enqueueSnackbar('No songs added to queue', { variant: 'error' });
            return [{}];
        }
    };






    const handleScrapeSet = (video) => {
        let videoId = video["id"]["videoId"];
        let setInfo = {}
        setInfo["channelId"] = video["snippet"]["channelId"];
        setInfo["channelName"] = video["snippet"]["channelTitle"];
        setInfo["setName"] = video["snippet"]["title"];
        setInfo["setId"] = videoId;

        setAddedSets((prevAddedSets) => {
            // Create a new array to avoid mutating the state directly
            let updatedSets = [...prevAddedSets, videoId];
            updatedSets = Array.from(new Set(updatedSets)); // Fix: Replace 'set' with 'Set'

            if (updatedSets.length > MAX_SETS) {
                updatedSets.shift(); // Removes the first item
            }

            return updatedSets;
        });
        // setaddedSets([...addedSets, videoId]);

        //api call to backend to scrape set music
        scrapeSetMusic(videoId, setInfo).then((response) => {

        })

    }


    const fetchVideos = async (channelId) => {

        try {
            let res = await axios({
                url: API_URL + '/api/videos',
                method: 'post',
                data: { channelId: channelId },
                timeout: 8000,
                headers: axiosConfig
            })
            if (res.status === 200) {

                return res.data
            }
            return [{}]
        }
        catch (err) {
            console.error('There was an error!', err);
            return [{}]
        }


    }


    const [channelVideos, setChannelVideos] = useState({})
    const channelVideosRef = useRef(channelVideos);

    useEffect(() => {
        channelVideosRef.current = channelVideos;
    }, [channelVideos]); // Update ref whenever `currentVideo` changes


    useEffect(() => {

        Promise.all(Channels.map(channel => fetchVideos(channel["channelId"])))
            .then(responses => {
                let channelVideosCopy = objectCopy(channelVideos);
                responses.forEach(response => {
                    if (response.length > 0) {
                        channelVideosCopy[response[0]["snippet"]["channelId"]] = response;
                    }
                });
                setChannelVideos(channelVideosCopy);
                setCurrentVideo(channelVideosCopy[Channels[0]["channelId"]][0])
                console.log("CHANNEL VIDS")
                console.log(channelVideosCopy)
                // Optionally set the current video here, if needed
            })
            .catch(error => console.error("Error fetching videos:", error));

        ;
    }, []);



    function formatDateEST(isoDateString: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/New_York'
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        return formatter.format(new Date(isoDateString));
    }


    const handlePlaySet = (video) => {

        setCurrentVideo(video)
        setCurrentlyPlayingType('SETS')
    }

    const handlePlaySong = (video) => {
        setCurrentlyPlayingType('SONGS')
        setCurrentVideo(video)
    }

    const handleRemoveSong = (video) => {
        let allVideosCopy = objectCopy(songVideos)
        let allIds = allVideosCopy.map((video) => video.id.videoId)
        let index = allIds.indexOf(video.id.videoId)
        allVideosCopy.splice(index, 1)
        setSongVideos(allVideosCopy);
        // Update local storage
        localStorage.setItem('songVideos', JSON.stringify(allVideosCopy));
        enqueueSnackbar('Song removed from queue', { variant: 'success' });
    }


    // Function to like a video via YouTube API
    const likeVideo = async (accessToken, videoId) => {
        try {
            await axios.post(`https://www.googleapis.com/youtube/v3/videos/rate`, null, {
                params: {
                    id: videoId,
                    rating: 'like',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
            }).then((response) => {
                enqueueSnackbar('Video liked successfully', { variant: 'success' });
                addVideoToLikes(videoId);
            });



        } catch (error) {
            console.error('Error liking video:', error);
            enqueueSnackbar('Error liking video', { variant: 'error' });

        }
    };


    const handleLike = (videoId) => {
        if (!userInfo.accessToken) {
            return;
        }

        likeVideo(userInfo.accessToken, videoId);
    };



    const getPreviousDisabled = () => {
        var disabled = false
        if (currentlyPlayingType === 'SETS') {
            disabled = (channelVideos[currentChannelId].map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === 0 || channelVideos[currentChannelId].length === 0)
        }
        else {
            disabled = songVideos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === 0 || songVideos.length === 0
        }
        return disabled
    }

    const handlePlayPrevious = () => {
        if (!getPreviousDisabled()) {
            if (currentlyPlayingTypeRef.current === 'SETS') {
                for (let i = 1; i < channelVideosRef.current[currentVideoRef.current.snippet.channelId].length; i++) {
                    if (channelVideosRef.current[currentVideoRef.current.snippet.channelId][i].id.videoId === currentVideoRef.current.id.videoId) {
                        setCurrentVideo(channelVideosRef.current[currentVideoRef.current.snippet.channelId][i - 1])
                        return
                    }
                }
                // setCurrentVideo(channelVideos[currentChannelId][0])
            }
            else {
                for (let i = 1; i < songVideosRef.current.length; i++) {
                    if (songVideosRef.current[i].id.videoId === currentVideoRef.current.id.videoId) {
                        setCurrentVideo(songVideosRef.current[i - 1])
                        return
                    }
                }
                // setCurrentVideo(songVideos[0])
            }
        }
        else {
            return
        }


    }

    const getNextDisabled = () => {

        var disabled = false
        if (currentlyPlayingTypeRef.current === 'SETS') {
            disabled = channelVideos[currentChannelId].map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === (channelVideos[currentChannelId].length - 1) || channelVideos[currentChannelId].length === 0
        }
        else {

            disabled = songVideos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === (songVideos.length - 1) || songVideos.length === 0
        }

        return disabled
    }


    const handlePlayNext = () => {
        if (!getNextDisabled()) {
            if (currentlyPlayingTypeRef.current === 'SETS') {
                for (let i = 0; i < channelVideosRef.current[currentVideoRef.current.snippet.channelId].length; i++) {
                    if (channelVideosRef.current[currentVideoRef.current.snippet.channelId][i].id.videoId === currentVideoRef.current.id.videoId) {
                        setCurrentVideo(channelVideosRef.current[currentVideoRef.current.snippet.channelId][i + 1])
                        return
                    }
                }
                // setCurrentVideo(channelVideos[currentChannelId][0])
            }
            else {
                for (let i = 0; i < songVideosRef.current.length; i++) {

                    if (songVideosRef.current[i].id.videoId === currentVideoRef.current.id.videoId) {
                        setCurrentVideo(songVideosRef.current[i + 1])
                        return
                    }
                }
                // setCurrentVideo(songVideos[0])
            }
        }
        else {
            return
        }


    }

    const [filter, setFilter] = useState("")
    const handleSetFilter = (e) => {
        setFilter(e.target.value)
    }
    const getFiltered = (video, filter) => {
        if (filter === "") {
            return true
        }
        else {
            return video.snippet.title.toLowerCase().includes(filter.toLowerCase())
        }
    }


    const getRWDisabled = () => {
        if (currentlyPlayingTypeRef.current === 'SETS') {
            if (currentTime < 300) {
                return true
            }
        } else {
            if (currentTime < 30) {
                return true
            }
        }
        return false
    }
    const handleRW = () => {
        if (currentlyPlayingTypeRef.current === 'SETS') {
            if (childRef.current) {
                childRef.current.seekSeconds(-300);
            }
        } else {
            childRef.current.seekSeconds(-30);

        }
    }

    const getFFDisabled = () => {
        return false
    }

    const handleFF = () => {
        if (currentlyPlayingTypeRef.current === 'SETS') {
            if (childRef.current) {
                childRef.current.seekSeconds(300);
            }
        } else {
            childRef.current.seekSeconds(30);
        }
    }

    const getUnplayedSongs = () => {
        let allSongIds = songVideos.map((video) => video.id.videoId)
        let unplayed = allSongIds.filter((songId) => !playedSongs.includes(songId))
        return unplayed.length
    }

    const getUnplayedSets = () => {

        var unplayed = []
        if(channelVideos[currentChannelId]){
            let allSetIds = channelVideos[currentChannelId].map((video) => video.id.videoId)
            unplayed = allSetIds.filter((setId) => !playedSets.includes(setId))
        }

        return unplayed.length

    }
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div>
                        <AboutModal open={open} onClose={handleClose} />

           <Typography
            // style={{ }}
            id="header-title"
          >
            THE DOWNLOAD.

          </Typography>

            {currentVideo &&
                <>
                    <Grid container item xs={12} lg={5.5} className="main-video-outer-wrapper">

                        <Grid item xs={12}
                            className="main-video-outer" style={{ margin: "0 auto", padding: 5 }}>



                            <Grid item xs={12}>

                                <>
                                    <YouTubePlayer
                                        ref={childRef}
                                        songVideos={songVideos}
                                        channelVideos={channelVideos}
                                        handlePlayNext={handlePlayNext}
                                        addId={addId}
                                        updateCurrentTime={setCurrentTime}
                                        // radioValue={radioValue}
                                        currentlyPlayingType={currentlyPlayingType}
                                        videoId={currentVideo.id.videoId} />

                                </>

                            </Grid>

                        </Grid>


                        <Grid xs={12} item container className="video-buttons-container">
                            <Grid container item xs={12} id="video-buttons-upper" style={{ padding: 5 }}>
                                <Grid container item xs={2} lg={6} justifyContent="flex-start" alignItems="center">
                                    <Grid item xs={12} lg={4} style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 0 }}>
                                        <Button
                                            className={"video-button"}
                                            fullWidth
                                            
                                            // variant="contained"
                                            // color="primary"
                                            onClick={(e) => handleRW()}
                                            disabled={getRWDisabled()}>
                                            <FastRewindIcon /> {currentlyPlayingType === 'SETS' ? " 5m" : " 30s"}
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid container item xs={2} lg={6} justifyContent="flex-end" alignItems="center">
                                    <Grid item xs={12} lg={4} style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 10 }}>
                                        <Button
                                            fullWidth
                                            className={"video-button"}
                                            onClick={(e) => handleFF()}
                                            disabled={getFFDisabled()}>
                                            {currentlyPlayingType === 'SETS' ? " 5m" : " 30s"} <FastForwardIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} style={{  }}>
                                <Grid container item xs={2} lg={6} justifyContent="flex-start" alignItems="center" className="ff-rw-sm vbc">
                                    <Grid item xs={12} lg={4} style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 0 }}>
                                        <Button
                                            className={"video-button"}
                                            fullWidth
                                            
                                            // variant="contained"
                                            // color="primary"
                                            onClick={(e) => handleRW()}
                                            disabled={getRWDisabled()}>
                                            <FastRewindIcon /> <span className={"vbt"}>{currentlyPlayingType === 'SETS' ? " 5m" : " 30s"}</span>
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Grid item xs={2} lg={3} style={{ textAlign: "left", paddingLeft: 0 }} className="video-button-container-inner vbc">
                                    <Button
                                        className={"video-button"}
                                        fullWidth
                                        // variant="contained"
                                        // color="primary"
                                        onClick={(e) => handlePlayPrevious()}
                                        disabled={getPreviousDisabled()}>
                                        <SkipPreviousIcon /> <span className={"vbt"}>{currentlyPlayingType === 'SETS' ? "Set" : "Song"}</span>
                                    </Button>

                                </Grid>

                                <Grid item xs={currentlyPlayingType === 'SETS' ? 2 : 4} lg={currentlyPlayingType === 'SETS' ? 3 : 6} className={"like-add-container video-button-container-inner vbc"}>

                                    <Tooltip
                                        placement="left"
                                        title={!userInfo.accessToken ? "Please Login to Google Account to Like Videos" : "Like on YouTube"}>
                                        
                                        <Button
                                            className={"video-button"}
                                            fullWidth
                                            // variant="contained"
                                            // color="primary"
                                            disabled={!userInfo.accessToken || likedVideos.includes(currentVideo.id.videoId)}
                                            onClick={(e) => handleLike(currentVideo.id.videoId)}>
                                               {likedVideos.includes(currentVideo.id.videoId) && 
                                                <>
                                                Liked
                                                </>
                                               } 
                                                {!likedVideos.includes(currentVideo.id.videoId) && 
                                                <>
                                                <ThumbUpOffAltIcon style={{ marginRight: 5 }} />  <span className={"vbt"}>{currentlyPlayingType === 'SETS' ? "Set" : "Song"}</span>

                                                </>
                                               } 
                                        </Button>
                                    </Tooltip>
                                </Grid>
                                {currentlyPlayingType === 'SETS' &&

                                    <Grid item xs={2} lg={3} className={"like-add-container video-button-container-inner vbc"}>
                                        <Button variant="contained"
                                            className={"video-button"}
                                            fullWidth
                                            style={{}}
                                            disabled={addedSets.includes(currentVideo["id"]["videoId"])}
                                            onClick={(e) => handleScrapeSet(currentVideo)}
                                        >
                                            {!addedSets.includes(currentVideo["id"]["videoId"]) &&
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <AddIcon style={{ marginRight: 4 }} /> <span className={"vbt"}>Songs</span>
                                                </span>
                                            }

                                            {addedSets.includes(currentVideo["id"]["videoId"]) &&
                                                <span>Added</span>
                                            }
                                        </Button>

                                    </Grid>
                                }



                                <Grid item xs={2} lg={3}  style={{ textAlign: "right", paddingRight: 0 }} className="video-button-container-inner vbc">
                                    <Button
                                        className={"video-button"}
                                        fullWidth
                                        // variant="contained"
                                        // color="primary"
                                        onClick={(e) => handlePlayNext()}
                                        disabled={getNextDisabled()}>
                                        <span className={"vbt"}>{currentlyPlayingType === 'SETS' ? "Set" : "Song"}</span>  <SkipNextIcon />
                                    </Button>

                                </Grid>
                                <Grid container item xs={2} lg={6} justifyContent="flex-end" alignItems="center" className="ff-rw-sm vbc">
                                    <Grid item xs={12} lg={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            fullWidth
                                            className={"video-button"}
                                            onClick={(e) => handleFF()}
                                            disabled={getFFDisabled()}>
                                            <span className={"vbt"}>{currentlyPlayingType === 'SETS' ? " 5m" : " 30s"}</span> <FastForwardIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>







                        </Grid>



                    </Grid>
                </>
            }

            <Grid container justifyContent="flex-end" xs={12}>

                <Grid item container sm={12} lg={6.5} id="main-content-outer">
                    <Grid item id="login-container">
                    <IconButton style={{padding: "0px 30px"}} onClick={handleOpen}>
        <InfoIcon style={{color: "white", fontSize: 32}}/> {/* This is the "About This App" icon */}
      </IconButton>

                        <Login />
                    </Grid>
                    <Grid item container xs={12} id="main-content-control-panel-outer">
                        <Grid item container xs={12} id="main-content-control-panel-inner">

                            <Grid className="sets-songs-button-holder" item xs={6} lg={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    style={{
                                        backgroundColor: "transparent",
                                        padding: 8,
                                        borderRadius: 0,
                                        border: "none"
                                    }}
                                    color="primary"
                                    value="SETS"
                                    onClick={(e) => handleRadioChange("SETS")}
                                    className={"sets-songs-button sets " + (radioValue === 'SETS' ? "active" : "")}
                                >
                                    <b>SETS</b>
                                </Button>
                            </Grid>
                            <Grid item xs={6} lg={6} className="sets-songs-button-holder">
                                <Button
                                    fullWidth
                                    style={{
                                        backgroundColor: "transparent",
                                        padding: 8,
                                        borderRadius: 0,
                                        border: "none"
                                    }}

                                    variant="contained"
                                    color="primary"
                                    value="SONG QUEUE"
                                    onClick={(e) => handleRadioChange("SONG QUEUE")}
                                    className={"sets-songs-button songs " + (radioValue === 'SONG QUEUE' ? "active" : "")}
                                >
                                    <b>SONGS</b>
                                </Button>
                            </Grid>
                            <Grid item container xs={12} style={{}}>

                                <Grid item id={"channel-switcher-outer-wrapper"} xs={6} lg={6} style={{ background: "transparent" }}>
                                    {radioValue === 'SETS' &&
                                        <ChannelsSelectWithArrows
                                            Channels={Channels}
                                            currentChannelId={currentChannelId}
                                            handleSetChannelId={handleSetChannelId}
                                        />
                                    }

                                </Grid>
                                <Grid item id="search-filter-bar-outer" xs={radioValue === 'SETS' ? 6 : 12} >
                                    <TextField
                                        fullWidth
                                        onChange={(e) => handleSetFilter(e)}
                                        variant="outlined"
                                        color="primary"
                                        value={filter}
                                        placeholder={"Filter"}
                                        // style={{}}
                                        // size="small"
                                        style={{ }}
                                        className={"search-filter-bar"} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container xs={12} className="card-holder-outer" justifyContent="flex-end" item style={{}}>
                            
                        {radioValue === 'SETS' &&
                            <>
                                <p className="unplayed-text">Unplayed Sets: {getUnplayedSets()}</p>
                            </>
                        }
                        {radioValue === 'SONG QUEUE' &&
                            <>
                                <p className="unplayed-text">Unplayed Songs: {getUnplayedSongs()}</p>
                            </>
                        }
                        {radioValue === 'SETS' &&
                            <Grid className="card-holder-inner sets" item xs={12}
                                style={{
                                    // margin: "0 auto", 
                                    // padding: 20,
                                    background: "transparent",
                                }}
                            >

                                <Grid item id="youtube-card-holder">

                                    {channelVideos[currentChannelId] !== undefined &&

                                        <>
                                            {channelVideos[currentChannelId].map((video, index) => (
                                                <>
                                                    {getFiltered(video, filter) &&
                                                        <>

                                                            <Grid className={"set-card-outer" + (playedSets.includes(video["id"]["videoId"]) ? " already-played" : "") + (currentVideo.id.videoId === video.id.videoId ? " playing" : "")} container key={index} xs={12}>
                                                                <Grid className="set-card-inner" item container xs={12} style={{}}>
                                                                    <Grid item xs={1.5} component="div" style={{ backgroundColor: "black" }} container alignItems="center">
                                                                        <img width={"100%"} src={video.snippet.thumbnails.default.url}></img>
                                                                    </Grid>
                                                                    <Grid item xs={7.5} style={{ textAlign: "left", padding: "0px 5px" }}>
                                                                        <h3 className="set-title-text" dangerouslySetInnerHTML={{ __html: video.snippet.title}}>
                                                                            </h3>
                                                                        <p className="published-text">Published: {formatDateEST(video.snippet.publishedAt)}</p>
                                                                        {/* {playedSets.includes(video["id"]["videoId"]) &&
                                                                    <>ALREADY PLAYED</>
                                                                } */}
                                                                    </Grid>
                                                                    <Grid item xs={1.5} style={{ textAlign: "center", padding: "0px 2px" }}>
                                                                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Button variant="contained"
                                                                                fullWidth
                                                                                className="card-button "
                                                                                // color="secondary"
                                                                                disabled={currentVideo.id.videoId === video.id.videoId}
                                                                                style={{ margin: "0 auto", marginTop: 0, fontSize: 12 }} // Adjusted marginTop
                                                                                onClick={(e) => handlePlaySet(video)}
                                                                            >
                                                                                {currentVideo.id.videoId === video.id.videoId &&
                                                                                    <><PlayCircleIcon /></>
                                                                                }
                                                                                {!(currentVideo.id.videoId === video.id.videoId) &&
                                                                                    <>
                                                                                        {!playedSets.includes(video["id"]["videoId"]) &&
                                                                                            <>
                                                                                                <PlayArrowIcon />
                                                                                            </>
                                                                                        }
                                                                                        {playedSets.includes(video["id"]["videoId"]) &&
                                                                                            <>
                                                                                                <ReplayIcon />
                                                                                            </>
                                                                                        }

                                                                                        {/* {playedSets.includes(video["id"]["videoId"]) ? "Again" : "Set"} */}

                                                                                    </>
                                                                                }
                                                                            </Button>
                                                                        </div>
                                                                    </Grid>
                                                                    <Grid item xs={1.5} style={{ textAlign: "center", padding: "0px 2px" }}>
                                                                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Button variant="contained"
                                                                                // color="secondary"
                                                                                className="card-button add-songs"
                                                                                fullWidth
                                                                                style={{ margin: "0 auto", marginTop: 0, fontSize: 12 }} // Adjusted marginTop
                                                                                disabled={addedSets.includes(video["id"]["videoId"])}
                                                                                onClick={(e) => handleScrapeSet(video)}
                                                                            >
                                                                                {addedSets.includes(video["id"]["videoId"]) ? <p style={{fontSize: 13}}>Added</p> : <p style={{fontSize: 13}}><AddIcon style={{ marginRight: 5 }} />Songs</p>}
                                                                            </Button>
                                                                        </div>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>




                                                        </>
                                                    }
                                                </>

                                            ))}




                                        </>
                                    }

                                </Grid>



                            </Grid>
                        }
                        {radioValue === 'SONG QUEUE' &&
                            <Grid className="card-holder-inner songs" item xs={12} style={{ margin: "0 auto" }}>

                                {songVideos.map((video, index) => (

                                    <>
                                    {getFiltered(video, filter) && 
                                        <>
                                        <Grid className={"song-card-outer" + (playedSongs.includes(video["id"]["videoId"]) ? " already-played" : "") + (currentVideo.id.videoId === video.id.videoId ? " playing" : "")} container key={index} xs={12}>
                                            <Grid className="set-card-inner" item container xs={12} style={{}}>

                                                <Grid item xs={1.5}  >
                                                    {/* image thumbnail for each of the videos */}
                                                    <img width={"100%"} height={"100%"} src={video.snippet.thumbnails.default.url}></img>

                                                </Grid>
                                                <Grid item xs={6} style={{ textAlign: "left", padding: "0px 5px" }}>
                                                    <h3 style={{ margin: "5px 0px" }}  className="song-title-text" dangerouslySetInnerHTML={{ __html: video.snippet.title}}></h3>
                                                    <p className="artist-text" dangerouslySetInnerHTML={{ __html: video.snippet.channelTitle.replace("- Topic", "")}}></p>
                                                    <a className="song-set-link" href={"https://www.youtube.com/watch?v=" + video["setId"]} target="_blank" dangerouslySetInnerHTML={{ __html: video["channelName"] + ": " + video["setName"] }}></a>
                                                </Grid>


                                                <Grid item xs={1.5} style={{ textAlign: "center", padding: "0px 2px" }}>
                                                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Button
                                                            className="card-button"
                                                            // style={{ margin: "0 auto", marginTop: 0 }}
                                                            disabled={currentVideo.id.videoId === video.id.videoId}
                                                            onClick={(e) => handlePlaySong(video)}
                                                            fullWidth
                                                        >
                                                            {currentVideo.id.videoId === video.id.videoId &&
                                                                <><PlayCircleIcon /></>
                                                            }
                                                            {!(currentVideo.id.videoId === video.id.videoId) &&
                                                                <>{playedSongs.includes(video["id"]["videoId"]) ? <ReplayIcon /> : <PlayArrowIcon />}</>
                                                            }


                                                            {/* {video["id"]["videoId"]} */}
                                                            {/* {playedSongs.join(", ")} */}

                                                        </Button>
                                                    </div>
                                                </Grid>



                                                <Tooltip
                                                    placement="left"
                                                    title={!userInfo.accessToken ? "Please Login to Google Account to Like Videos" : "Like on YouTube"}>
                                                    <Grid item xs={1.5} style={{ textAlign: "center", padding: "0px 2px" }}>
                                                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Button
                                                                // variant="contained"
                                                                // color="secondary"
                                                                className="card-button like"
                                                                disabled={!userInfo.accessToken || likedVideos.includes(currentVideo.id.videoId)}
                                                                onClick={(e) => handleLike(video.id.videoId)}
                                                                fullWidth
                                                            >
                                                                {likedVideos.includes(video.id.videoId) && 
                                                                    <>Liked</>
                                                                }
                                                                {!likedVideos.includes(video.id.videoId) && 
                                                                    <ThumbUpOffAltIcon />

                                                                }
                                                            </Button>
                                                        </div>
                                                    </Grid>
                                                </Tooltip>

                                                <Grid item xs={1.5} style={{ textAlign: "center", padding: "0px 2px" }}>
                                                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Button
                                                            // variant="contained"
                                                            // color="secondary"
                                                            className="card-button  remove"
                                                            style={{ margin: "0 auto", marginTop: 0 }}
                                                            // disabled={currentVideo.id.videoId === video.id.videoId}
                                                            onClick={(e) => handleRemoveSong(video)}

                                                            fullWidth
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </Button>
                                                    </div>
                                                </Grid>


                                            </Grid>
                                        </Grid>


                                                                </>
                                    }
                                    </>
                                ))}

                            </Grid>
                            
                        }


                    </Grid>
              

                </Grid>
            </Grid>

        </div>
    );
}
