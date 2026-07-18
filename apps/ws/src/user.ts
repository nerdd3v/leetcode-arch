import { WebSocket } from "ws";

interface UAI{
    ws: WebSocket,
    subscription: string[]
}

export class User{
    private userAndSubscription: UAI[];
    static instance: User;

    private constructor(){
   
        this.userAndSubscription = [];
    }

    static getInstance(ws:WebSocket){
        if(!this.instance){
            this.instance = new User();
        }
        return this.instance
    }
    
    addSubscription(subscription: string | string[], ws:WebSocket){
        try {
            const userExists = this.userAndSubscription.find(u => u.ws == ws);

            const newSubs = Array.isArray(subscription) ? subscription : [subscription];

            if(userExists){
                const uniqueSubs = new Set([...userExists.subscription, ...newSubs]);
                userExists.subscription = Array.from(uniqueSubs);
            }
            else{
                this.userAndSubscription.push({
                    ws,
                    subscription: Array.from(new Set(newSubs))
                })
            }
            console.log("user subcription added")
        } catch (error) {
            console.log("error occured in adding subscription for the user")
        }
    }

    removeSubscription(subscription: string| string[], ws: WebSocket){
        const userExists = this.userAndSubscription.find(u => u.ws === ws);
        if(!userExists){
            console.log("user with ws provided does not exist");
            return;
        }
        
        const subsToRemove = Array.isArray(subscription)? subscription : [subscription]

        userExists.subscription = userExists.subscription.filter(sub => !subsToRemove.includes(sub))
        
        if(userExists.subscription.length == 0){
            this.cleanup(ws)
        }
    }

    cleanup(ws: WebSocket){
        this.userAndSubscription = this.userAndSubscription.filter(u => u.ws !== ws)
    }
}