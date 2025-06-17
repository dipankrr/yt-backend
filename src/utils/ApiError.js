
class ApiError extends Error {

    constructor (
        statusCode,
        message = "Something we wrong!!!!",
        errors = [],
        stack = ""
    ){
        super(message)
        this.message = message
        this.data = null
        this.success = false
        this.errors = errors
        this.statusCode = statusCode

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }

}

export {ApiError}