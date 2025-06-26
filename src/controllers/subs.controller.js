import { Subscription } from "../models/subscription.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// const subscribeChannel = asyncHandler ( async (req, res) => {

//     // check if user is loggedIn
//     // 

//     const subscriber = req.user?._id

//     const newSub = await Subscription.create(
//         {
//             channel: // TODO : ?? ,
//             subscriber: subscriber
//         }
//     )

//     if (!newSub) {
//         throw new ApiError(500, {}, "Something went wrong while subscribing")
//     }

//     return res.status(200).json(
//         new ApiResponse(200, newSub, "Subscribed !!")
//     )

// })