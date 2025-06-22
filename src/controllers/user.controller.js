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



export {registerUser, loginUser, logoutUser}