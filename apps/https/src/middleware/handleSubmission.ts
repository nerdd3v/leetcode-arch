import client from "./redis.js";

export const handleSubmission = async(object: any)=>{
    await client.lPush("submission", object)
}