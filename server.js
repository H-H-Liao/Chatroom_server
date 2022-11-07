import {WebSocketServer} from 'ws'
import url from 'url'
import {without, contains} from 'underscore'
import dotenv from 'dotenv'

const port = parseInt(dotenv.config('PORT',80));
const wss = new WebSocketServer({ port: 8088 });

let $list = [];
let $id = 0;

wss.on('connection', function connection(ws, req) {
    const $url = url.parse(req.url, true);
    let $username = $url.query.username;

    //檢查是否有重複的使用者
    if(contains($list, $username)) {
        $username = null;
        ws.close();
    }else{
        console.log($username + 'Open connection')
        $list.push($username);
        ws.id = $id++;
        //通知所有人在線使用者列表
        noticeAllUserList(wss,$list);
    }

    ws.on('message', function message(data) {
        const $obj = {
            type: "message",
            user:$username,
            content:String(data)
        };
        wss.clients.forEach(client => {
            client.send(JSON.stringify($obj));
        })
    });

    ws.on('close', () => {
        //移除使用者
        if($username){
            $list = without($list, $username);
            console.log($username + ' Close connected')
        }
        noticeAllUserList(wss,$list);
    })
});

//通知所有人在線使用者列表
const noticeAllUserList = (wss, $list) => {
    wss.clients.forEach(function (client) {
        const $obj = {
            type: "room_information",
            room_name: "Room",
            list:$list
        };
        client.send(JSON.stringify($obj));
    });
}