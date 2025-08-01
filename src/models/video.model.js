import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloud/AWS
            required: true,
        },
        title: {
            type: String,  
            required: true,
        },
        description: {
            type: String,  
            
        },
        thumbnail: {
            type: String, // Cloud/AWS
    
        },
        duration: {
            type: Number,  
            required: true,
        },
        views: {
            type: Number,  
            default: 0,
        },
        isPublished: {
            type: Boolean, 
            default: true,
        },
        uploader: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }


    
}, {timestamps: true})


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)