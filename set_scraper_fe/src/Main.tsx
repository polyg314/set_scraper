import React, { useContext, useEffect, useRef, useState } from "react";
import { AppBar, Autocomplete, Grid, Tab, Tabs, Typography } from "@mui/material";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import { Header } from "./Header";
import axios from 'axios';
import { Button, Select, TextField, Toolbar, Tooltip } from "@material-ui/core";
import { API_URL, Channels } from "./utils/constants";

import { axiosConfig } from "./utils/constants";
import { objectCopy } from "./utils/miscFunctions";
import YouTubePlayer from "./components/YouTubePlayer";
import { UserContext } from "./hooks/userContext";
import { useSnackbar } from 'notistack';
import "./styles/main.scss"
import { MenuItem, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { ChannelsSelectWithArrows } from "./components/ChannelsSelectWithArrows";

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



    const [songVideos, setSongVideos] = useState(() => {
        // Attempt to load saved songs from local storage
        const savedSongs = localStorage.getItem('songVideos');
        return savedSongs ? JSON.parse(savedSongs) : [];
    });



    const [currentVideo, setCurrentVideo] = useState(null)



    const [playedSets, setPlayedSets] = useState(() => {
        const storedSets = localStorage.getItem('playedSets');
        console.log("played sets")
        console.log(storedSets)
        return storedSets ? JSON.parse(storedSets) : [];
    });

    const [addedSets, setAddedSets] = useState(() => {
        const storedSets = localStorage.getItem('addedSets');
        console.log("played sets")
        console.log(storedSets)
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
        // console.log("added sets")
        // console.log(JSON.stringify(addedSets))
        localStorage.setItem('addedSets', JSON.stringify(addedSets));
    }, [addedSets]);


    // Function to add a new set ID, ensuring the max length is not exceeded

    const currentVideoRef = useRef(currentVideo);

    useEffect(() => {
        currentVideoRef.current = currentVideo;
    }, [currentVideo]); // Update ref whenever `currentVideo` changes


    const currentlyPlayingTypeRef = useRef(currentlyPlayingType);

    useEffect(() => {
        currentlyPlayingTypeRef.current = currentlyPlayingType;
    }, [currentlyPlayingType]);


    const addSetId = () => {

        setPlayedSets((prevPlayedSets) => {
            console.log(currentVideoRef.current.id.videoId)
            // Create a new array to avoid mutating the state directly
            let updatedSets = [...prevPlayedSets, currentVideoRef.current.id.videoId];
            updatedSets = Array.from(new Set(updatedSets)); // Fix: Replace 'set' with 'Set'

            if (updatedSets.length > MAX_SETS) {
                updatedSets.shift(); // Removes the first item
            }
            return updatedSets;
        });
    };


    const [playedSongs, setPlayedSongs] = useState(() => {
        const storedSongs = localStorage.getItem('playedSongs');
        console.log("played songs")
        console.log(storedSongs)
        return storedSongs ? JSON.parse(storedSongs) : [];
    });

    // Update local storage whenever playedSongs changes
    useEffect(() => {
        localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
    }, [playedSongs]);

    // Function to add a new set ID, ensuring the max length is not exceeded
    const addSongId = () => {
        console.log("ADD SONG ID")
        setPlayedSongs((prevPlayedSongs) => {
            console.log(currentVideoRef.current.id.videoId)
            // Create a new array to avoid mutating the state directly
            let updatedSongs = [...prevPlayedSongs, currentVideoRef.current.id.videoId];
            updatedSongs = Array.from(new Set(updatedSongs)); // Fix: Replace 'Song' with 'Song'

            if (updatedSongs.length > MAX_SONGS) {
                updatedSongs.shift(); // Removes the first item
            }
            return updatedSongs;
        });
    };

    const addId = (newId) => {
        console.log("add id")
        console.log(currentlyPlayingTypeRef)
        console.log(newId)
        if (currentlyPlayingTypeRef.current === "SETS") {
            addSetId()
        } else if (currentlyPlayingTypeRef.current === "SONGS") {
            addSongId()
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
                console.log("HIHIHI");
                console.log(res.data.video_details);
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
        console.log(video)
        let videoId = video["id"]["videoId"];
        console.log('videoId:', videoId);
        let setInfo = {}
        setInfo["channelId"] = video["snippet"]["channelId"];
        setInfo["channelName"] = video["snippet"]["channelTitle"];
        setInfo["setName"] = video["snippet"]["title"];
        setInfo["setId"] = videoId;

        setAddedSets((prevAddedSets) => {
            console.log(videoId)
            // Create a new array to avoid mutating the state directly
            let updatedSets = [...prevAddedSets, videoId];
            updatedSets = Array.from(new Set(updatedSets)); // Fix: Replace 'set' with 'Set'

            if (updatedSets.length > MAX_SETS) {
                updatedSets.shift(); // Removes the first item
            }
            console.log("NEW ADDED")
            console.log(updatedSets)
            return updatedSets;
        });
        // setaddedSets([...addedSets, videoId]);

        //api call to backend to scrape set music
        scrapeSetMusic(videoId, setInfo).then((response) => {
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
                let channelVideosCopy = objectCopy(channelVideos);
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
        setCurrentVideo(video)
        setCurrentlyPlayingType('SETS')
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
        if (currentlyPlayingType === 'SETS') {
            disabled = (channelVideos[currentChannelId].map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === 0 || channelVideos[currentChannelId].length === 0)
        }
        else {
            disabled = songVideos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === 0 || songVideos.length === 0
        }
        return disabled
    }

    const getNextDisabled = () => {

        var disabled = false
        if (currentlyPlayingType === 'SETS') {
            disabled = channelVideos[currentChannelId].map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === (channelVideos[currentChannelId].length - 1) || channelVideos[currentChannelId].length === 0
        }
        else {
            disabled = songVideos.map((video) => video.id.videoId).indexOf(currentVideo.id.videoId) === (songVideos.length - 1) || songVideos.length === 0
        }
        return disabled
    }


    const handlePlayNext = (videoId) => {
        if (!getNextDisabled()) {
            if (currentlyPlayingTypeRef.current === 'SETS') {
                for (let i = 0; i < channelVideos[currentChannelId].length; i++) {
                    if (channelVideos[currentChannelId][i].id.videoId === videoId) {
                        setCurrentVideo(channelVideos[currentChannelId][i + 1])
                        return
                    }
                }
                setCurrentVideo(channelVideos[currentChannelId][0])
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
        else return


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
                                        handlePlayNext={handlePlayNext}
                                        addId={addId}
                                        // radioValue={radioValue}
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
                                        Previous {currentlyPlayingType === 'SETS' ? "Set" : "Song"}
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
                                            Like  {currentlyPlayingType === 'SETS' ? "Set" : "Song"}
                                        </Button>
                                    </Tooltip>
                                    {currentlyPlayingType === 'SETS' &&
                                        <Button variant="contained"
                                            color="secondary"
                                            style={{ marginLeft: 10 }}
                                            disabled={addedSets.includes(currentVideo["id"]["videoId"])}
                                            onClick={(e) => handleScrapeSet(currentVideo)}
                                        >
                                            {!addedSets.includes(currentVideo["id"]["videoId"]) &&
                                                <span>Add Songs To Queue</span>
                                            }

                                            {addedSets.includes(currentVideo["id"]["videoId"]) &&
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
                                        Next  {currentlyPlayingType === 'SETS' ? "Set" : "Song"}
                                    </Button>

                                </Grid>
                            </Grid>




                        </>
                    }

                </Grid>

                {/* </Grid> */}
                <Grid item container xs={12} lg={8}
                    style={{
                        margin: "0 auto",
                        background: "#ffe500",
                        paddingBottom: 0
                    }}>
                    <Grid 
                        item 
                        xs={4} 
                        container
                        className={"sets-songs-buttons-container" + (radioValue === 'SETS' ? " sets" : " songs")}
                    >
                        <Grid item xs={6} lg={6}>
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
                        <Grid item xs={6} lg={6}>
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
                                <b>SONG QUEUE</b>
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item xs={6} lg={4}>
                        <ChannelsSelectWithArrows
                            Channels={Channels}
                            currentChannelId={currentChannelId}
                            handleSetChannelId={handleSetChannelId}
                        />
                        {/* <Select
                            fullWidth
                            variant="outlined"
                            color="primary"
                            value={currentChannelId}
                            onChange={(e) => handleSetChannelId(e.target.value)}
                            style={{backgroundColor: "white"}}
                            className={"current-channel-select"}>
                            {Channels.map((channel, index) => (
                                <option value={channel["channelId"]}>{channel["channelName"]}</option>
                            ))}
                        </Select> */}
                    </Grid>
                    <Grid item xs={6} lg={4}>
                        <TextField
                            fullWidth
                            onChange={(e) => handleSetFilter(e)}
                            variant="outlined"
                            color="primary"
                            value={filter}
                            placeholder={"Filter"}
                            style={{ backgroundColor: "white" }}
                            size="small"
                            className={"search-bar"} />
                    </Grid>

                </Grid>


                {/* 
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
 */}

            </Grid>

            <Grid container item style={{ padding: 0, background: "green", marginTop: 426, textAlign: "center" }}>

                {radioValue === 'SETS' &&
                    <Grid item xs={12} md={8} style={{ margin: "0 auto", background: "beige", paddingBottom: 20 }}>

                        <Grid item id="youtube-card-holder">
                            {channelVideos[currentChannelId] !== undefined &&

                                <>
                                    {channelVideos[currentChannelId].map((video, index) => (
                                        <>
                                        {getFiltered(video, filter) && 
                                            <>
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
                                                    // disabled={addedSets.includes(video["id"]["videoId"])}
                                                    onClick={(e) => handlePlaySet(video)}
                                                >
                                                    Play Set
                                                </Button>

                                                <Button variant="contained"
                                                    color="secondary"
                                                    style={{ margin: "0 auto", marginTop: 20 }}
                                                    disabled={addedSets.includes(video["id"]["videoId"])}
                                                    onClick={(e) => handleScrapeSet(video)}
                                                >
                                                    {!addedSets.includes(video["id"]["videoId"]) &&
                                                        <span>Add Songs To Queue</span>
                                                    }

                                                    {addedSets.includes(video["id"]["videoId"]) &&
                                                        <span>Added</span>
                                                    }
                                                </Button>

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
                    <Grid item xs={12} md={8} style={{ margin: "0 auto", background: "orange", paddingBottom: 20 }}>

                        {songVideos.map((video, index) => (
                            <Grid container key={index} xs={12}>
                                {/* {videos.map((video, index) => ( */}
                                <Grid item xs={4} md={4}>
                                    <img src={video.snippet.thumbnails.default.url}>

                                    </img>


                                </Grid>
                                <Grid item xs={8} md={8}>
                                    <h2>
                                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
                                            {video.snippet.title}
                                        </a>
                                    </h2>
                                    <p>{video.snippet.description}</p>

                                    <Button variant="contained"
                                        color="secondary"
                                        style={{ margin: "0 auto", marginTop: 20 }}
                                        disabled={currentVideo.id.videoId === video.id.videoId}
                                        onClick={(e) => handlePlaySong(video)}
                                    >
                                        {currentVideo.id.videoId === video.id.videoId &&
                                            <>Playing...</>
                                        }
                                        {!(currentVideo.id.videoId === video.id.videoId) &&
                                            <>Play Song</>
                                        }


                                        {/* {video["id"]["videoId"]} */}
                                        {/* {playedSongs.join(", ")} */}

                                    </Button>
                                    {playedSongs.includes(video["id"]["videoId"]) &&
                                        <><h3>ALREADY PLAYED</h3></>
                                    }

                                    <h5>{video["setId"]}</h5>
                                    <h5>{video["setName"]}</h5>
                                    <h5>{video["channelId"]}</h5>
                                    <h5>{video["channelName"]}</h5>

                                </Grid>

                            </Grid>
                        ))}

                    </Grid>
                }
            </Grid>
        </div>
    );
}
