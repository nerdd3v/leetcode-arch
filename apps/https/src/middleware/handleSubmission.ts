import client from "@repo/redis"

export const handleSubmission = async(object: any)=>{
    await client.lPush("submission",object)
}