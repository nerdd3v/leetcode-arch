import { WebSocketServer, WebSocket } from "ws"
import { User } from "./user.js"
import { routeMessage } from "./router.js"



const wss = new WebSocketServer({port: 8080})

wss.on("connection", (ws:WebSocket)=>{
    const user = User.getInstance(ws);

    ws.on("message", (rawData)=>{
        routeMessage(rawData, ws)
    })

    ws.on("close", ()=>{
        user.cleanup(ws);
    })
})