class apiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        data=null,
        errors=[],
        status="error"
    ){
        super(message)
        this.statusCode=statusCode
        this.message=message
        this.data=null
        this.errors=errors
        this.success=false
        this.data=data
        this.status=status
    }
}


module.exports={
    apiError
}