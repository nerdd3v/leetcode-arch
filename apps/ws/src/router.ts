import { WebSocket } from "ws";
import { createClient } from "redis";
import { User } from "./user.js";

const client = createClient({
    url: "redis://localhost:6379"
})

await client.connect();
export const routeMessage = async(message:WebSocket.RawData, ws: WebSocket)=>{
    const data = JSON.parse(message.toString());
    const {type, uid} = data;

    switch(type){
        case "JOIN":
            const subscriptionChannel = `channel:${uid}`
            console.log("join message received")
            User.getInstance(ws).addSubscription(subscriptionChannel, ws);
            await client.subscribe(subscriptionChannel, (redisMsg) => {
                    try {
                        // Safe parsing boundary
                        const response = JSON.parse(redisMsg);
                        const { status } = response;

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(status);
                        }
                    } catch (parseErr) {
                        console.error("Malformed Redis payload received; skipping frame broadcast.");
                    }
                });
                break;
        default:
            console.log("unknow type (action)")
            break;
    }
}