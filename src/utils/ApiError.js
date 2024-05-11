class ApiError extends Error{
      constructor(
            statuscode,
            message="something went wrong",
            errors=[]
      ){
            super(message);
            this.message=message;
            this.statuscode=statuscode;
            this.errors=errors
      }
};

export default ApiError;