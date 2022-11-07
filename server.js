import {WebSocketServer} from 'ws'
import url from 'url'
import {without, contains} from 'underscore'
import dotenv from 'dotenv'

const port = parseInt(dotenv.config('PORT',80));
const wss = new WebSocketServer({ port: 8088 });

//客服人員列表
let $staff_list = [];

//顧客端列表
let $client_list = [{
                        username:"王小明",
                        user_id:1
                    },
                    {
                        username:"陳聰明",
                        user_id:2
                    }];

console.log('啟動聊天室伺服器');

wss.on('connection', function connection(ws, req) {
    //抓取傳入的token
    const $url = url.parse(req.url, true);
    const $token = $url.query.token;

    //呼叫api server檢驗身份
    const $check_information = checkToken($token)

    ws.uid = $check_information.user_id;//存入user_id
    
    if(!$check_information.success){//驗證失敗踢出聊天室
        ws.close();
    }

    if(hasRepeatLogin()){//移除重複登入的使用者
        removeRepeatLoginUser();
    }


    //根據角色載入資料
    switch($check_information.role){
        case 'staff':
             //客服人員載入所有服務的顧客
            break;
        case 'client':
            //顧客端載入聊天室內最近10筆記錄
            break;
    }
    
    ws.on('message', function message(data) {
        const $json = JSON.parse(String(data));
        //根據傳入的類型配適道相對應的function
        switch($json.type){
            case "go_client_room"://客服人員獲取顧客的room
                ws.send(getClientRoom());
                break;
            case "message"://傳送訊息
                senMessage(ws.uid, $json.to_uid,$json.message);
                break;
            case "history"://要求歷史對話
                break;
            case "close"://手動點選結束對話
                break;
        }
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

const checkToken = ($token) => {
    return {
        success:true,
        role:'staff',
        user_id:1
    };
}

const hasRepeatLogin = () => {
    return true;
}

const removeRepeatLoginUser = () => {

}

const getClientRoom = () => {
    const $object = {
        room_list: $client_list
    }
    return JSON.stringify($object);
}

const senMessage = ($from, $to, $role, $message) => {
    //存入資料庫
    wss.clients.forEach(function (client) {
        if(client.uid == $from){
            client.send($message);
        }else if(client.uid == $to){
            client.send($message);
        }
    });
}