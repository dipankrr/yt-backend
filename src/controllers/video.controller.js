import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"


// check if user loggedIn
// get video*, thumbnail, title*, desc, etc
// multer middleware
// 


const uploadVideo = asyncHandler ( async (req, res) => {

    // have to loggedIn (isLoggedIN middleware)
    // multer middleware for title and thumbnail
    // upload on cloudinary
    // get title, desc
    // get uploader from req.user
    // create a video 


})

const getUserAllVideos = asyncHandler ( async (req, res) => {

    // have to loggedIn (isLoggedIN middleware)
    // multer middleware for title and thumbnail
    // upload on cloudinary
    // get title, desc
    // get uploader from req.user
    // create a video 


})



// getVideo