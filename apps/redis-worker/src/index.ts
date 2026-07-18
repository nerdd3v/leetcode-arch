import { createClient } from "redis";

const client = createClient({
    url: "redis://localhost:6379"
})

const runWorker = async()=>{
    await client.connect();
    while(true){
        let c = await client.brPop("submission", 0);
        console.log(`processing ${c?.element}`)

        
        if(c){
            let num = Math.floor(Math.random()*100);
            let status;
            const {id, uid, code} = JSON.parse(c.element);
            if(num %2 == 0){
                status = "pass";
                console.log(`processes and the output is ::::  ${status}`)
            }
            else{
                status = "fail"
                console.log(`processes and the output is ::::  ${status}`)
            }

            await client.publish(`channel:${uid}`, JSON.stringify({
                status,
                uid
            }))
            console.log("published")
        }
    }
}

runWorker();