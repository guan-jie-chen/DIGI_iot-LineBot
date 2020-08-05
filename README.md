# DIGI_iot-LineBot
### 安裝環境
>https://sites.google.com/jes.mlc.edu.tw/ljj/linebot%E5%AF%A6%E5%81%9A/%E5%AE%89%E8%A3%9Dnode-js%E7%94%B3%E8%AB%8Bheroku?authuser=0 請參考吉哥的分享 - 安裝node.js申請heroku
>
>https://sites.google.com/jes.mlc.edu.tw/ljj/linebot%E5%AF%A6%E5%81%9A/%E5%A6%82%E4%BD%95%E7%94%B3%E8%AB%8Blinebot?authuser=0 請參考吉哥的分享 - 如何申請linebot
### 說明
利用Line Bot控制Webduino偵測溫度、濕度，濕度超過設定門檻值會發出Line警告推播
### Line指令
```
溫度 -->偵測一次溫度
```
```
濕度 -->偵測一次濕度
```
```
每XX秒回報 -->XX為設定秒數
```
```
xx%警告 -->xx為設定濕度上限，超過每10秒發送一次警告
```
```
停止 -->停止回報溫溼度
```
```
停止警告 -->停止目前發出的警告推播
```
### 硬體設備
1. 馬克一號
2. 溫濕度感測器
3. 手機(需有Line軟體，並加入Bot)