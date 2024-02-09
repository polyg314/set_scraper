import React, { useEffect, useState } from "react";
import { AppBar, Grid, Tab, Tabs, Typography } from "@mui/material";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import { Header } from "./Header";
import axios from 'axios';
import { Button } from "@material-ui/core";
import { API_URL } from "./utils/constants";

import { axiosConfig } from "./utils/constants";
import { objectCopy } from "./utils/miscFunctions";


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

    const [radioValue, setRadioValue] = React.useState('SETS');

    const [videos, setVideos] = useState<Video[]>([]);

    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
    // console.log(API_KEY);
    const [channelID, setChannelID] = useState('UCJOtExbMu0RqIdiE4nMUPxQ');

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(event.target.value);
        setRadioValue(event.target.value);
    };

    const [songVideos, setSongVideos] = useState([]);


    const [videosAdded, setVideosAdded] = useState<any>([]);


    // axiosConfig["Authorization"] = jwt
    

    const fetchVideoDetails = async (videoIds) => {
        const idsString = videoIds.join(','); // Join the video IDs into a comma-separated string
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${idsString}&key=${API_KEY}&part=snippet,contentDetails,statistics`;

        try {
            const response = await axios.get(url);
            const videoData = response.data.items; // Array of video details

            // Append new video data to the existing state
            // setSongVideos(prevVideos => [...prevVideos, ...videoData]);
        } catch (error) {
            console.error('Failed to fetch video details:', error);
        }
    };


    const scrapeSetMusic = async (videoId:string) => {
        
        // try {
        //     let res = await axios({
        //          url: API_URL + '/get-youtube-info-init',
        //          method: 'get',
        //         //  data: {videoId: videoId},
        //          timeout: 8000,
        //          headers: axiosConfig
        //      })
        //      if(res.status === 200){
        //         console.log(res)

        //          return res.data
        //      }    
        //      return [{}]
        //  }
        //  catch (err) {
        //      console.error('There was an error!', err);
        //      return [{}]
        //  }
        console.log("SCRAPE IT")
        console.log("SONG VIDS")
        console.log(songVideos)
        try {
            let res = await axios({
                 url: API_URL + '/scrape_set',
                 method: 'post',
                 data: {videoId: videoId},
                 timeout: 8000,
                 headers: axiosConfig
             })
             if(res.status === 200){
                if(res.data.video_details){
                    console.log("HIHIHI")
                    console.log(res.data.video_details)
                    // var songVideoCopy = objectCopy(songVideos)
                    // songVideoCopy.push
                    
                    setSongVideos([...songVideos, ...res.data.video_details])
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


    const fetchVideos = async () => {
        
        try {
            let res = await axios({
                 url: API_URL + '/api/videos',
                 method: 'get',
                //  data: {videoId: videoId},
                 timeout: 8000,
                 headers: axiosConfig
             })
             if(res.status === 200){
                console.log(res)
                setVideos(res.data.items);
                 return res.data
             }    
             return [{}]
         }
         catch (err) {
             console.error('There was an error!', err);
             return [{}]
         }

         
     }

    // const fetchVideos = 


    // const fetchVideos = async () => {
    //     try {
    //         const response = await axios.get(
    //             `https://www.googleapis.com/youtube/v3/search`, {
    //             params: {
    //                 part: 'snippet',
    //                 channelId: channelID,
    //                 maxResults: 20,
    //                 order: 'date',
    //                 type: 'video',
    //                 key: API_KEY,
    //             },
    //         }
    //         );
    //         console.log(response.data.items);

    //         setVideos(response.data.items);
    //     } catch (error) {
    //         console.error('Error fetching videos:', error);
    //     }
    // }

    

    useEffect(() => {
        


        fetchVideos();
    }, [channelID]);



    const [currentVideo, setCurrentVideo] = useState(null)

    return (
        <div>
            <Header />
            
            <Grid container spacing={2} style={{ padding: 50, marginTop: 100, textAlign: "center" }}>

            <Grid item xs={12}>
                    {currentVideo  === null && 
                        <>Choose video</>
                    } 
                    {currentVideo !== null &&
                    <>
                                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}`}
                        title={currentVideo.title}
                    />
                    </>
                    }
  
                </Grid>
                <Grid item xs={12} md={8} style={{ margin: "0 auto", background: "#ffe500", paddingBottom: 20 }}>
                    <FormControl component="fieldset" style={{ margin: "0 auto" }}>
                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            value={radioValue}
                            onChange={handleRadioChange}
                        >
                            <FormControlLabel
                                value="SETS"
                                control={<Radio />}
                                label={<Typography style={{ fontWeight: 'bold' }}>SETS</Typography>}
                            />
                            <FormControlLabel
                                value="SONG QUEUE"
                                control={<Radio />}
                                label={<Typography style={{ fontWeight: 'bold' }}>SONG QUEUE</Typography>}
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                
                
                {radioValue === 'SETS' &&
                    <Grid item xs={12} md={8} style={{ margin: "0 auto", background: "beige", paddingBottom: 20 }}>

                        <Grid item id="youtube-card-holder">
                            {videos.map((video, index) => (
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
