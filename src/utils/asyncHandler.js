
const asyncHandler = (func) => (req, res, next) => {
    Promise
    .resolve( func(req, res, next) )  // TODO: have to use return explecitly as curly braces are used after arrow func or remove curly braces
    .catch(
        (error) => next(error)
    )
}




// const asyncHandler = (func) => { return () => {//work here} }
// const asyncHandler = (func) => () => {//work here}     //(simpler & doesn't have to return exp)


// const asyncHandler = (fn) => async (req, res, next) => { 
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
        
//     }
// } 