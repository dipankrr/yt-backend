import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js"

dotenv.config();

//const port = process.env.PORT || 8000



connectDB()
.then(() => {
    app.listen( process.env.PORT, () => {
        console.log(`Express server running on port: ${process.env.PORT}`)
    })
    
    // app.on("error", (error) => {
    //         console.log("ERROR", error);
    //         throw error
    // })
    
})
.catch((error) => {
    console.log("Express connecting error", error)
})












// ( async () => {
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.error("ERROR: ", error);
//         throw error
//     }
// })()