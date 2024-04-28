class apiResponse {
    constructor (status,data,message="Success"){
        this.data=data
        this.message=message
        this.status=status

    }
}

module.exports={
    apiResponse
}