import { createClient } from "redis"

const client = createClient({
    url: "redis://localhost:6379",
})

export const handleSubmission = async(object: any)=>{
    await client.lPush("submission",object)
}

export {client};