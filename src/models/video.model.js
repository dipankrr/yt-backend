import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloud/AWS
            required: true,
        },
        title: {
            type: String, // Cloud/AWS
            required: true,
        },
        description: {
            type: String, // Cloud/AWS
            required: true,
        },
        thumbnail: {
            type: String, // Cloud/AWS
            required: true,
        },
        duration: {
            type: Number, // Cloud/AWS
            required: true,
        },
        views: {
            type: Number, // Cloud/AWS
            default: 0,
        },
        isPublished: {
            type: Boolean, // Cloud/AWS
            default: true,
        },
        uploader: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }


    
}, {timestamps: true})


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)