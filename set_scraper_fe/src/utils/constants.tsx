// local API 
export const API_URL = 'http://localhost:5001';

// prod API
// export const API_URL = 'https://set-scraper-be-2l2i6lgdxq-wl.a.run.app';
export var axiosConfig = {
    // "Access-Control-Allow-Methods":"GET,PUT,POST,DELETE,PATCH,OPTIONS",
    // "Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
    'Content-Type': 'application/json',
};  


export const Channels = [
    {
        channelName: "The Lot Radio", 
        channelId: "UCJOtExbMu0RqIdiE4nMUPxQ", 
        website: "https://www.thelotradio.com/"
    },
    // {
    //     channelName: "Rinse FM",
    //     channelId: "UCgGfSxNOBkJDtCQ932iQU7Q"
    // },
    // {
    //     channelName: "Rinse France",
    //     channelId: "UCcTI8Xsh6DnXuCSKFP4WqkA"
    // },
    // {
    //     channelName: "Hor Berlin",
    //     channelId: "UCmfF7JZv26UUKyRedViGIlw"
    // },
    // {
    //     channelName: "DubLab",
    //     channelId: "UCNtXPcWEu0VU66oxmscwr5Q"
    // },
    // {
    //     channelName: "Boiler Room",
    //     channelId: "UCGBpxWJr9FNOcFYA5GkKrMg"
    // }
]
