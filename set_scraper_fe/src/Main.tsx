import React, { useContext, useEffect, useState } from "react";
import { AppBar, Grid, Tab, Tabs, Typography } from "@mui/material";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import { Header } from "./Header";
import axios from 'axios';
import { Button, Toolbar, Tooltip } from "@material-ui/core";
import { API_URL, Channels } from "./utils/constants";

import { axiosConfig } from "./utils/constants";
import { objectCopy } from "./utils/miscFunctions";
import YouTubePlayer from "./components/YouTubePlayer";
import { UserContext } from "./hooks/userContext";
import { useSnackbar } from 'notistack';
import "./styles/main.scss"

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

    const [currentlyPlayingType, setCurrentlyPlayingType] = useState('SETS')

    const { userInfo, setUserInfo } = useContext(UserContext);

    const [radioValue, setRadioValue] = React.useState('SETS');

    const [videos, setVideos] = useState<Video[]>([]);

    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    // console.log(API_KEY);
    // const [channelID, setChannelID] = useState('UCJOtExbMu0RqIdiE4nMUPxQ');

    const handleRadioChange = (v) => {
        // console.log(event.target.value);
        setRadioValue(v);
    };

    const [songVideos, setSongVideos] = useState([]);


    const [videosAdded, setVideosAdded] = useState<any>([]);

    const [currentVideo, setCurrentVideo] = useState(null)

    const MAX_SETS = 3;

    const [playedSets, setPlayedSets] = useState(() => {
        const storedSets = localStorage.getItem('playedSets');
        return storedSets ? JSON.parse(storedSets) : [];
    });
    
      // Update local storage whenever playedSets changes
      useEffect(() => {
        localStorage.setItem('playedSets', JSON.stringify(playedSets));
      }, [playedSets]);
    
      // Function to add a new set ID, ensuring the max length is not exceeded
    const addSetId = (newSetId) => {
        console.log("ADD SET ID")
        setPlayedSets((prevPlayedSets) => {
            // Create a new array to avoid mutating the state directly
            let updatedSets = [...prevPlayedSets, newSetId];
            updatedSets = Array.from(new Set(updatedSets)); // Fix: Replace 'set' with 'Set'
            if(updatedSets !== prevPlayedSets){
                // If the length exceeds MAX_SETS, remove the oldest entry (first in the array)
                if (updatedSets.length > MAX_SETS) {
                    updatedSets.shift(); // Removes the first item
                }
            }

            
            return updatedSets;
        });
    };



    const MAX_SONGS = 5;

    const [playedSongs, setPlayedSongs] = useState(() => {
        const storedSongs = localStorage.getItem('playedSongs');
        console.log(storedSongs)
        return storedSongs ? JSON.parse(storedSongs) : [];
    });
    
      // Update local storage whenever playedSongs changes
      useEffect(() => {
        localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
      }, [playedSongs]);
    
      // Function to add a new set ID, ensuring the max length is not exceeded
    const addSongId = (newSongId) => {
        console.log("ADD SONG ID")
        setPlayedSongs((prevPlayedSongs) => {
            // Create a new array to avoid mutating the state directly
            let updatedSongs = [...prevPlayedSongs, newSongId];
            updatedSongs = Array.from(new Set(updatedSongs)); // Fix: Replace 'set' with 'Set'
            if(updatedSongs !== prevPlayedSongs){
                // If the length exceeds MAX_Songs, remove the oldest entry (first in the array)
                if (updatedSongs.length > MAX_SONGS) {
                    updatedSongs.shift(); // Removes the first item
                }
            }

            
            return updatedSongs;
        });
    };

    const addId = (newId) => {
        console.log("add id")
        console.log(currentlyPlayingType)
        if(currentlyPlayingType === "SETS"){
            addSetId(newId)
        }else if(currentlyPlayingType === "SONGS"){
            addSongId(newId)
        }   
    }


    const { enqueueSnackbar } = useSnackbar();

    const [currentChannelId, setCurrentChannelId] = useState(Channels[0]["channelId"])

    const handleSetChannelId = (channelId) => {
        setCurrentChannelId(channelId)
    }


    // axiosConfig["Authorization"] = jwt


    // const fetchVideoDetails = async (videoIds) => {
    //     const idsString = videoIds.join(','); // Join the video IDs into a comma-separated string
    //     const url = `https://www.googleapis.com/youtube/v3/videos?id=${idsString}&key=${API_KEY}&part=snippet,contentDetails,statistics`;

    //     try {
    //         const response = await axios.get(url);
    //         const videoData = response.data.items; // Array of video details

    //         // Append new video data to the existing state
    //         // setSongVideos(prevVideos => [...prevVideos, ...videoData]);
    //     } catch (error) {
    //         console.error('Failed to fetch video details:', error);
    //     }
    // };


    const scrapeSetMusic = async (videoId: string) => {

        console.log("SCRAPE IT")
        console.log("SONG VIDS")
        console.log(songVideos)
        try {
            let res = await axios({
                url: API_URL + '/scrape_set',
                method: 'post',
                data: { videoId: videoId },
                timeout: 8000,
                headers: axiosConfig
            })
            if (res.status === 200) {
                if (res.data.video_details) {
                    console.log("HIHIHI")
                    console.log(res.data.video_details)
                    for (let i = 0; i < res.data.video_details.length; i++) {
                        let id = res.data.video_details[i].id
                        res.data.video_details[i].id = {}
                        res.data.video_details[i].id.videoId = id
                        res.data.video_details[i]["channelId"] = currentChannelId   
                        res.data.video_details[i]["setId"] = videoId 

                    }
                    // var songVideoCopy = objectCopy(songVideos)
                    // songVideoCopy.push
                    let songIds = songVideos.map((video) => video.id.videoId)
                    var videosToAdd = []
                    for (let i = 0; i < res.data.video_details.length; i++) {
                        if (!(res.data.video_details[i].id.videoId in songIds)) {
                            videosToAdd.push(res.data.video_details[i])
                        }
                    }
                    setSongVideos([...songVideos, ...videosToAdd])

                    // fetchVideoDetails(res.data.ids)
                }
                return res.data
            }
            return [{}]
        }
        catch (err) {
            console.error('There was an error!', err);
            return [{}]
        }

    }




    const handleScrapeSet = (videoId) => {
        console.log('videoId:', videoId);
        setVideosAdded([...videosAdded, videoId]);

        //api call to backend to scrape set music
        scrapeSetMusic(videoId).then((response) => {
            console.log('response:', response);
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
                // console.log(res)

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

    
    useEffect(() => {

        Promise.all(Channels.map(channel => fetchVideos(channel["channelId"])))
        .then(responses => {
          const channelVideosCopy = objectCopy(channelVideos);
          responses.forEach(response => {
            if (response.length > 0) {
              channelVideosCopy[response[0]["snippet"]["channelId"]] = response;
            }
          });
          setChannelVideos(channelVideosCopy);
          setCurrentVideo(channelVideosCopy[Channels[0]["channelId"]][0])
          
          // Optionally set the current video here, if needed
        })
        .catch(error => console.error("Error fetching videos:", error));

        ;
    }, []);






    const handlePlaySet = (video) => {
        console.log("PLAY SET")
        console.log(video)
        setCurrentlyPlayingType('SETS')

        // if(currentlyPlayingType !== 'SETS'){

        // }
        setCurrentVideo(video)
        // addSetId(video["id"]["videoId"])
    }

    const handlePlaySong = (video) => {
        console.log("PLAY SONG")
        console.log(currentlyPlayingType)
        setCurrentlyPlayingType('SONGS')
        // if(currentlyPlayingType !== 'SONGS'){
        //     console.log('setting currently playing type')
           
        // }
        // var id = video["id"]
        // video["id"] = {}
        // video["id"]["videoId"] = id
        // console.log(video)
        // console.log(currentVideo.id.videoId)
        // video["id"]["video_id"] = video["id"]
        setCurrentVideo(video)
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
                console.log('response:', response);
                console.log('Video liked successfully');
                enqueueSnackbar('Video liked successfully', { variant: 'success' });
            });



        } catch (error) {
            console.error('Error liking video:', error);
            enqueueSnackbar('Error liking video', { variant: 'error' });

        }
    };


    const handleLike = (videoId) => {
        if (!userInfo.accessToken) {
            console.log('User is not authenticated.');
            return;
        }

        likeVideo(userInfo.accessToken, videoId);
    };

    const handlePlayPrevious = (videoId) => {
        for (let i = 0; i < songVideos.length; i++) {
            if (songVideos[i].id.videoId === videoId) {
                setCurrentVideo(songVideos[i - 1])
                return
            }
        }
        setCurrentVideo(songVideos[0])

    }

    const getPreviousDisabled = () => {
        var disabled = false
        if (radioValue === 'SETS') {
            disabled = (videos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === 0 || videos.length === 0)
        }
        else {
            disabled = songVideos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === 0 || songVideos.length === 0
        }
        return disabled
    }

    const getNextDisabled = () => {
        var disabled = false
        if (radioValue === 'SETS') {
            disabled = videos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === (videos.length - 1) || videos.length === 0
        }
        else {
            disabled = songVideos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === (songVideos.length - 1) || songVideos.length === 0
        }
        return disabled
    }


    const handlePlayNext = (videoId) => {
        if (radioValue === 'SETS') {
            for (let i = 0; i < videos.length; i++) {
                if (videos[i].id.videoId === videoId) {
                    setCurrentVideo(videos[i + 1])
                    return
                }
            }
            setCurrentVideo(videos[0])
        }
        else {
            for (let i = 0; i < songVideos.length; i++) {
                if (songVideos[i].id.videoId === videoId) {
                    setCurrentVideo(songVideos[i + 1])
                    return
                }
            }
            setCurrentVideo(songVideos[0])
        }


    }


   


    return (
        <div>
            <Header />

            <Grid container item xs={12} style={{ position: "fixed", top: 76, zIndex: 100 }}>

                <Grid item xs={12} lg={8} style={{ margin: "0 auto", background: "blue", padding: 5 }}>
                    {currentVideo === null &&
                        <>Choose video</>
                    }
                    {currentVideo !== null &&
                        <>

                            <Grid item xs={12}>

                                <>
                                    <YouTubePlayer 
                                    addId={addId}
                                    radioValue={radioValue}
                                    currentlyPlayingType={currentlyPlayingType}
                                    videoId={currentVideo.id.videoId} />

                                </>

                            </Grid>


                            <Grid container item xs={12} style={{ padding: 5 }}>
                                <Grid item xs={4} style={{ textAlign: "left" }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={(e) => handlePlayPrevious(currentVideo.id.videoId)}
                                        disabled={getPreviousDisabled()}>
                                        Previous {radioValue === 'SETS' ? "Set" : "Song"}
                                    </Button>

                                </Grid>

                                <Grid item xs={4}>
                                    <Tooltip
                                        placement="left"
                                        title={!userInfo.accessToken ? "Please Login to Google Account to Like Videos" : "Like on YouTube"}>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={!userInfo.accessToken}
                                            onClick={(e) => handleLike(currentVideo.id.videoId)}>
                                            Like  {radioValue === 'SETS' ? "Set" : "Song"}
                                        </Button>
                                    </Tooltip>
                                    {radioValue === 'SETS' &&
                                        <Button variant="contained"
                                            color="secondary"
                                            style={{ marginLeft: 10 }}
                                            disabled={videosAdded.includes(currentVideo["id"]["videoId"])}
                                            onClick={(e) => handleScrapeSet(currentVideo["id"]["videoId"])}
                                        >
                                            {!videosAdded.includes(currentVideo) &&
                                                <span>Add Songs To Queue</span>
                                            }

                                            {videosAdded.includes(currentVideo) &&
                                                <span>Added</span>
                                            }
                                        </Button>

                                    }
                                </Grid>


                                <Grid item xs={4} style={{ textAlign: "right" }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={(e) => handlePlayNext(currentVideo.id.videoId)}
                                        disabled={getNextDisabled()}>
                                        Next  {radioValue === 'SETS' ? "Set" : "Song"}
                                    </Button>

                                </Grid>
                            </Grid>




                        </>
                    }

                </Grid>

                {/* </Grid> */}
                <Grid item container xs={12} lg={8} style={{ margin: "0 auto", background: "#ffe500", paddingBottom: 0 }}>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            value="SETS"
                            onClick={(e) => handleRadioChange("SETS")}
                            style={{}}
                            className={"sets-songs-button sets " + (radioValue === 'SETS' ? "active" : "")}
                        >
                            <b>SETS</b>
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            value="SONG QUEUE"
                            onClick={(e) => handleRadioChange("SONG QUEUE")}
                            style={{}}
                            className={"sets-songs-button songs " + (radioValue === 'SONG QUEUE' ? "active" : "")}
                        >
                            <b>SONG QUEUE</b>
                        </Button>
                    </Grid>


                </Grid>



                {radioValue === 'SETS' &&
                    <Grid item container xs={12} lg={8} style={{ margin: "0 auto", background: "#ffe500", paddingBottom: 0 }}>
                        {Channels.map((channel, index) => (

                            <Grid item xs={12 / Channels.length}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    value={channel["channelId"]}
                                    onClick={(e) => handleSetChannelId(channel["channelId"])}
                                    style={{}}
                                    className={"current-channel-button " + (currentChannelId === channel["channelId"] ? "active" : "")}
                                >
                                    <b>{channel["channelName"]}</b>
                                </Button>
                            </Grid>

                        ))
                        }



                    </Grid>
                }


            </Grid>

            <Grid container item style={{ padding: 0, background: "green", marginTop: 490, textAlign: "center" }}>

                {radioValue === 'SETS' &&
                    <Grid item xs={12} md={8} style={{ margin: "0 auto", background: "beige", paddingBottom: 20 }}>

                        <Grid item id="youtube-card-holder">
                            {channelVideos[currentChannelId] !== undefined &&

                                <>
                                    {channelVideos[currentChannelId].map((video, index) => (
                                        <Grid container key={index} xs={12}>
                                            {/* {videos.map((video, index) => ( */}
                                            <Grid item xs={4} md={4}>
                                                {/* image thumbnail for each of the videos */}
                                                <img width={"100%"} src={video.snippet.thumbnails.high.url}></img>


                                            </Grid>
                                            <Grid item xs={8} md={8}>
                                                <h2>
                                                    <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} target="_blank" rel="noreferrer">
                                                        {video.snippet.title}
                                                    </a>
                                                </h2>
                                                <p>{video.snippet.description}</p>
                                                {playedSets.includes(video["id"]["videoId"]) && 
                                                    <>ALREADY PLAYED</>
                                                }
                                                <Button variant="contained"
                                                    color="secondary"
                                                    style={{ margin: "0 auto", marginTop: 20 }}
                                                    // disabled={videosAdded.includes(video["id"]["videoId"])}
                                                    onClick={(e) => handlePlaySet(video)}
                                                >
                                                    Play Set
                                                </Button>

                                                <Button variant="contained"
                                                    color="secondary"
                                                    style={{ margin: "0 auto", marginTop: 20 }}
                                                    disabled={videosAdded.includes(video["id"]["videoId"])}
                                                    onClick={(e) => handleScrapeSet(video["id"]["videoId"])}
                                                >
                                                    {!videosAdded.includes(video) &&
                                                        <span>Add Songs To Queue</span>
                                                    }

                                                    {videosAdded.includes(video) &&
                                                        <span>Added</span>
                                                    }
                                                </Button>

                                            </Grid>

                                        </Grid>
                                    ))}




                                </>
                            }

                        </Grid>



                    </Grid>
                }
                {radioValue === 'SONG QUEUE' &&
                    <Grid item xs={12} md={8} style={{ margin: "0 auto", background: "orange", paddingBottom: 20 }}>

                        {songVideos.map((video, index) => (
                            <Grid container key={index} xs={12}>
                                {/* {videos.map((video, index) => ( */}
                                <Grid item xs={4} md={4}>
                                    <img src={video.snippet.thumbnails.default.url}>

                                    </img>
                                    {/* <iframe
                                            width="100%"
                                            height="200"
                                            src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                                            // title={video.snippet.title}
                                        /> */}

                                </Grid>
                                <Grid item xs={8} md={8}>
                                    <h2>
                                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
                                            {video.snippet.title}
                                        </a>
                                    </h2>
                                    <p>{video.snippet.description}</p>
                                    {playedSongs.includes(video["id"]["videoId"]) && 
                                                    <><h3>ALREADY PLAYED</h3></>
                                                }
                                    <Button variant="contained"
                                        color="secondary"
                                        style={{ margin: "0 auto", marginTop: 20 }}
                                        // disabled={videosAdded.includes(video["id"]["videoId"])}
                                        onClick={(e) => handlePlaySong(video)}
                                    >
                                        Play Song
                                    </Button>
                                    {/* <Button variant="contained"
                                            color="secondary"
                                            style={{ margin: "0 auto", marginTop: 20 }}
                                            disabled={videosAdded.includes(video["id"]["videoId"])}
                                            onClick={(e) => handleScrapeSet(video["id"]["videoId"])}
                                        >
                                            {!videosAdded.includes(video) &&
                                                <span>Add Songs To Queue</span>
                                            }

                                            {videosAdded.includes(video) &&
                                                <span>Added</span>
                                            }
                                        </Button> */}

                                </Grid>

                            </Grid>
                        ))}

                    </Grid>
                }
            </Grid>
        </div>
    );
}
