class apiResponse {
    constructor (data,message="Success"){
        this.data=data
        this.message=message
    }
}

module.exports={
    apiResponse
}