import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async (userID) => {
    try {
        
       const user = await User.findById(userID)

       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})

       return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    
    // get user details from frontend
    // validations - not empty
    // check if user already exist: username, email
    // check for images and avatar
    // upload them on cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from res
    // check for user creation
    // return response

    const {fullname, email, username, password} = req.body
    console.log( "email: ", email, "name: ", fullname, username, password )

    if (
        [fullname, email, username, password].some((field) => 
        field?.trim() === "" )
    ) {
        throw new ApiError(400, "All fields are required!!")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    console.log(existedUser);
    

    if (existedUser) {
        throw new ApiError(409, "User with email or username exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required : 1")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required : 2")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )

     if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");    
     }

     return res.status(201).json(
        new ApiResponse(200, createdUser, "SUCCESS: User registered")
     )

})

const loginUser = asyncHandler( async (req, res) => {

    // get username/email and password from req.body
    // check whether user provided fields
    // check username/email exists or not
    // if exists then check the pass
    // jwt access and refresh token
    // send in cookies

    const {username, email, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "Provide at least email or username ")
    }
    if (!password) {
        throw new ApiError(400, "Provide password please ")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User with username or email does not exist")
    }

    if (!await user.isPasswordCorrect(password)) {
        throw new ApiError(401, "Invalid Password")
    } 

    // generate access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
   
    // 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options )
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {user: loggedInUser, accessToken, refreshToken},
            "Logged in successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {

    // check if user logged in
    // remove access and refresh tokens from cookies
    // remove refresh token from User db

    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, {}, "User logged out successfully"
        )
    )

})

const subscribeChannel = asyncHandler( async (req, res) => {

    const userID = req.user?._id

    User.findByIdAndUpdate(userID, {

    })

})

const changeCurrentPassword = asyncHandler ( async (req, res) => {

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    if (!(await user.isPasswordCorrect(oldPassword))){

        throw new ApiError(402, "Wrong old password lol")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: true})

    return res.
    status(200)
    .json(
        new ApiResponse(200, {}, "Password changed successfully")
    )

})

const updateAccountDetails = asyncHandler ( async (req, res) => {

    const {fullname, email} = req.body 

    if ( !fullname && !email) {
        throw new ApiError(402, {}, "At least one field is required")
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        throw new ApiError(409, {}, "Email already in use");
    }

    const fields = {}

    if (fullname) fields.fullname = fullname;
    if (email) fields.email = email;

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: fields
        },
        {
            new: true
        }
    ).select("-password")


    return res.status(200).json(
        new ApiResponse(200, user, "Account details changed successfully" )
    )
})

const updateAvatar = asyncHandler ( async (req, res) => {

    const avatarLocalPath = req.file?.avatar?.path;

    if(!avatarLocalPath){
        throw new ApiError(401, {}, "Avatar local path is not found")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)

    if(!avatar) {
        throw new ApiError(500, {}, "Upload failed on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
         req.user?._id , 
        {
            $set: { avatar: avatar.url }
        },
        {
            new: true
        }
        ).select("-password")

        // TODO: deleteFileOnCloudinary and delete the older avatar

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar changed successfully")
    )

})

const updateCoverImage = asyncHandler ( async (req, res) => {

    const coverImageLocalPath = req.file?.avatar?.path;

    if(!coverImageLocalPath){
        throw new ApiError(401, {}, "coverImage local path is not found")
    }

    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(500, {}, "coverImage Upload failed on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
         req.user?._id , 
        {
            $set: { coverImage: coverImage.url }
        },
        {
            new: true
        }
        ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar changed successfully")
    )

})

const getUserChannelPage = asyncHandler ( async (req, res) => {

    // get username from params/body
    // check if channel (it is also a user) exists
    // apply aggregation pipeline

    const {username} = req.params

    if ( !username?.trim() ) {
        throw new ApiError(402,  "Channel name is required")
    }

    // const channelExists = await User.findOne({username: username})
    // if (!channelExists) {
    //     throw new ApiError(402, {}, "Channel does not exist")
    // }

    // MOTIVE: i want a single object with user's all data
    // i don't have follows and followers count
    // need to add those

    const channel = await User.aggregate([
        {
            $match: { username: username?.toLowerCase() }
        },
         // { _id: (ObjectId), username: 123, password: 123 }
        {
            $lookup: { 
                from: "subscriptions",
                as: "subscribers",
                localField: "_id", // this _id is username's _id
                foreignField: "channel" // 
            }
        },

        {
            $lookup: { 
                from: "subscriptions",
                as: "subscribedTo",
                localField: "_id",
                foreignField: "subscriber"
            }
        },

        {
            $addFields: {
                totalSubscriber: { 
                    $size: "$subscribers" 
                },
                totalSubscribedTo: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [ req.user?._id, "$subscribers.subscriber" ]},
                        then: true,
                        else: false
                    },
                }
            }
        },

        {
            $project: {
                fullname: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                totalSubscriber: 1,
                totalSubscribedTo: 1,
                isSubscribed: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError ( 404, {}, "Channel does not exist")
    }
    
    console.log(channel);
    
   
    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel fetched successfully")
    )
})

const getSubscribedChannelList = asyncHandler ( async (req, res) => {

})
///////////////////////////////////////////////////////////////////////

export {
    registerUser, 
    loginUser, 
    logoutUser,
    getUserChannelPage
}