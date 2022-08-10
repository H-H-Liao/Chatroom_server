import {WebSocketServer} from 'ws'


const wss = new WebSocketServer({ port: 8080 });

console.log('start')

wss.on('connection', function connection(ws) {
    console.log('connection');
    // console.log(ws);
    ws.on('message', function message(data) {
        console.log('received: %s', data);

        let clients = wss.clients
        //做迴圈，發送訊息至每個 client
        clients.forEach(client => {
            client.send(String(data))
        })
    });

    // const sendNowTime = setInterval(()=>{
    //     ws.send(String(new Date()))
    // },3000)

    ws.send('something');

    ws.on('close', () => {
        //連線中斷時停止 setInterval
        // clearInterval(sendNowTime)
        console.log('Close connected')
    })
});