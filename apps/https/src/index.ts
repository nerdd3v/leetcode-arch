import express from "express";
import client from "./middleware/redis.js";
import { handleSubmission } from "./middleware/handleSubmission.js";

const app = express();
app.use(express.json())

app.post("/submission", async(req, res)=>{
    const {code, id, uid} = req.body;

    if(!code || !id || !uid){
        return res.status(402).json({
            message: "code id or uid not found"
        })
    }

    try {
        const payload = JSON.stringify({
            code,
            id,
            uid
        })

        let codes = [];

        codes.push({code, id});

        await client.set(`${uid}:code`, JSON.stringify(codes) )

        await handleSubmission(payload);

        if(await(client.lLen("submission")) >= 0){
            console.log("success to send on the queue")
            return res.status(200).json({
                message: "success"
            })
        }
        else{
            console.log("payload never went to the queue")
            return res.status(400).json({
                message: "failure"
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: "internal error"
        })
    }
})

app.get("/mySubmissions", (req, res)=>{
    const {uid} = req.body;
    if(!uid){
        return res.status(403).json({
            message: "no uid hence no cached data available"
        })
    }
})


async function startServer(){
    try {
        await client.connect();
        app.listen(3000, ()=>{
            console.log("app listening")
        })
    } catch (error) {
        console.log("error occured in starting the server")
    }
}

startServer()