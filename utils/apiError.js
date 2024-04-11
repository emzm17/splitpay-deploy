class apiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors=[]
    ){
        super(message)
        this.statusCode=statusCode
        this.message=message
        this.data=null
        this.errors=errors
        this.success=false
    }
}


module.exports={
    apiError
}