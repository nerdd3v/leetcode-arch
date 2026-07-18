import { WebSocketServer, WebSocket } from "ws";
import client from "@repo/redis"; 

interface UserSession {
    ws: WebSocket;
    subscriptions: string[];
}

interface IncomingMessage {
    type: "JOIN" | "SUBMIT" | "LEAVE";
    uid: string;
    subscription?: string | string[];
    code?: string;
    id?: string;
}


const wss = new WebSocketServer({ port: 8080 });

let usersAndSubscriptions: UserSession[] = [];


client.connect();
wss.on('connection', (ws: WebSocket) => {
    console.log("Client connected via WebSocket.");

    ws.on('message', async (message) => {
        try {
            const parsedMessage: IncomingMessage = JSON.parse(message.toString());
            const { type, uid, subscription, code, id } = parsedMessage;

            const newRooms = Array.isArray(subscription) 
                ? subscription 
                : subscription ? [subscription] : [];

            switch (type) {
                case "JOIN": {
                    const existingUser = usersAndSubscriptions.find(user => user.ws === ws);
                    if (existingUser) {
                        existingUser.subscriptions = Array.from(
                            new Set([...existingUser.subscriptions, ...newRooms])
                        );
                    } else {
                        usersAndSubscriptions.push({ ws, subscriptions: newRooms });
                    }

                    const channelName = `response:user:${uid}`;
                    console.log(`Subscribing via shared pubSubClient to: ${channelName}`);

                    // Use the imported pubSubClient to manage the subscription stream
                    await client.subscribe(channelName, (messageString) => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(messageString);
                        }
                    });
                    break;
                }

                case "SUBMIT": {
                    const queuePayload = JSON.stringify({ code, id, uid });
                    // Use the main shared client to lPush safely
                    await client.lPush("submission", queuePayload);
                    break;
                }

                case "LEAVE": {
                    const channelName = `response:user:${uid}`;
                    await client.unsubscribe(channelName);
                    break;
                }
            }
        } catch (error) {
            console.error("Error handling payload:", error);
        }
    });

    ws.on('close', () => {
        usersAndSubscriptions = usersAndSubscriptions.filter(user => user.ws !== ws);
    });
});