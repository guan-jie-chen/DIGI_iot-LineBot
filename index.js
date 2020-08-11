require('webduino-js');
require('webduino-blockly');

var linebot = require('linebot');
var express = require('express');

var myBoardVars={device:'gERLE'};

var interval_DHT=0;
var buzzer;
var led;
var dht;
var temperatureWarning;
var timeWarnig;
var interval_DHT_str;

//設定警示濕度，預設70
var maxTemperature = 70;

//溫度過高警示，每10秒偵測一次
var intervalCheck=10;
var userId = '';//your userId
var bot = linebot({
  channelId: '',//your channelId
  channelSecret: '',//your channelSecret
  channelAccessToken: ''//your channelAccessToken
});

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
bot.on('message', function(event) {
   var myReply='';
   if (event.message.type === 'text') {
      myReply=processText(event);
   }
   event.reply(myReply).then(function(data) {
      // success 
      console.log(myReply);
   }).catch(function(error) {
      // error 
      console.log('error');
   });
});

function processText(eve){
   myMsg=eve.message.text;
   var myResult='';
   if (myMsg==='溫度'){
      if (!deviceIsConnected())
         myResult='裝置未連接！';
      else{
         dht.read().then(function(){
            myResult='溫度：'+dht.temperature+'度';
            sendMessage(eve,myResult);
         });
      }
   }
   else if (myMsg==='濕度'){
      if (!deviceIsConnected())
         myResult='裝置未連接！';
      else{
         dht.read().then(function(){
            myResult='濕度：'+dht.humidity+'%';
            sendMessage(eve,myResult);
         });
      }
   }
   else if (myMsg.indexOf('回報')>-1){
            intervalDHT(myMsg);
   }
   else if (myMsg.indexOf('%警告')>-1){
            setMaxTemperature(myMsg);
   }
   else if (myMsg==='停止警告'){
            myResult='已停止上限警告';
            clearInterval(temperatureWarning);
            led.off();
   }
   else if (myMsg==='停止' || myMsg==='stop'){
            myResult='停止回報';
            clearInterval(timeWarnig);
   }
    return myResult;
 }

 function intervalDHT(msg){
   msg=msg.replace('回報','');
   msg=msg.replace('每','');
   var unitTime=1000;
   var unitStr=msg[msg.length-1];
   if (!deviceIsConnected)
      bot.push(userId,'裝置未連接！');
   else if (unitStr==='時' || unitStr==='分' || unitStr==='秒'){
      if (unitStr==='秒')
         unitTime=1000;
      if (unitStr==='分')
         unitTime=60000;
      if (unitStr==='時')
         unitTime=3600000;
      msg=msg.substr(0,msg.length-1);
      if (isNaN(msg)){
         bot.push(userId,'我看不懂這個時間設定，我能理解的命令是：每XX秒回報、每XX分回報、每XX時回報');
      }else{
         interval_DHT_str=msg+unitStr;
         interval_DHT=Number(msg)*unitTime;
         bot.push(userId,'時間回報已設定為每'+interval_DHT_str+'回報');
         clearInterval(timeWarnig);
         timeWarnig=setInterval(setTimeWarnig,interval_DHT);
      }
   }
   else{
      bot.push(userId,'我看不懂這個時間設定，我能理解的命令是：每XX秒回報、每XX分回報、每XX時回報');
   }
}
 //傳送訊息的函式
function sendMessage(eve,msg){
   eve.reply(msg).then(function(data) {
      // success 
      return true;
   }).catch(function(error) {
      // error 
      return false;
   });
}

function buzzer_music(m) {
   var musicNotes = {};
   musicNotes.notes = [];
   musicNotes.tempos = [];
   if (m[0].notes.length > 1) {
     for (var i = 0; i < m.length; i++) {
       if (Array.isArray(m[i].notes)) {
         var cn = musicNotes.notes.concat(m[i].notes);
         musicNotes.notes = cn;
       } else {
         musicNotes.notes.push(m[i].notes);
       }
       if (Array.isArray(m[i].tempos)) {
         var ct = musicNotes.tempos.concat(m[i].tempos);
         musicNotes.tempos = ct;
       } else {
         musicNotes.tempos.push(m[i].tempos);
       }
     }
   } else {
     musicNotes.notes = [m[0].notes];
     musicNotes.tempos = [m[0].tempos];
   }
   return musicNotes;
 }

 boardReady(myBoardVars, true, function (board) {
    myBoard=board;
    board.systemReset();
    board.samplingInterval = 50;
    buzzer = getBuzzer(board, 6);
    led = getLed(board, 11);
    led.off();
    dht = getDht(board, 10);
 });

 //以下為檢查webduino是否已連線成功的函式
function deviceIsConnected(){
    if (myBoard===undefined)
       return false;
    else if (myBoard.isConnected===undefined)
       return false;
    else
       return myBoard.isConnected;
 }


function maxTemperatureCheck(){
   var myMsg;
   if (!deviceIsConnected()){
      myMsg='裝置未連接！';
      bot.push(userId,myMsg);
   }else{
      dht.read().then(function(){
         if (dht.humidity>=maxTemperature){
            myMsg='濕度過高警示，警告濕度為'+maxTemperature+'，現在濕度：'+dht.humidity;
            led.on();
            buzzer.play(buzzer_music([{ notes : ["C6","D6","E6","F6","G6","A6","B6"] , tempos : ["8","8","8","8","8","8","8"] }]).notes ,buzzer_music([{ notes : ["C6","D6","E6","F6","G6","A6","B6"] , tempos : ["8","8","8","8","8","8","8"] }]).tempos );
            bot.push(userId,myMsg);
         }
      });
   }
}
function setMaxTemperature(msg){
   msg=msg.replace('%警告','');
   if (isNaN(msg)){
      bot.push(userId,'我看不懂這個溫度設定，XX請指定為數字，指令為：XX%警告');
   }else{
      maxTemperature=Number(msg);
      bot.push(userId,'警告濕度已設為：'+msg+'%，超過時每'+intervalCheck+'秒警告');
      clearInterval(temperatureWarning);
      temperatureWarning=setInterval(maxTemperatureCheck,intervalCheck*1000);
   }
}
//持續偵測
function setTimeWarnig(){
   var myMsg;
   dht.read().then(function(){
      myMsg='目前濕度：'+dht.humidity+'%，目前溫度：'+dht.temperature+'度';
      bot.push(userId,myMsg);
   });
 }

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});