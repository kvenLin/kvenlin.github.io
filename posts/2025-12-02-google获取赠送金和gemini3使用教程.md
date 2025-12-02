---
title: Google获取赠送金和Gemini3使用教程
date: 2025-12-02
tags: [google, gemini3]
categories: 
  - tutorial
---
# Google获取赠送金和Gemini3使用教程

## Google获取赠送金
这里只是对于需要用到**Gemini3**模型的**apikey**来进行开发**开发者**才需要进行绑卡领取赠送金, 如果只是日常使用, 那么 [https://gemini.google.com/app](https://gemini.google.com/app) 完全够用了, 如果用量有限制可以淘宝找找开通账号学生认证就可以有免费一年的试用期.



ok, 默认你有一个Google账号, 没有的话可以网上找找教程注册一个.

注册登录aistudio: [https://aistudio.google.com/](https://aistudio.google.com/)

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764642187597-8ead1270-3713-480c-9f9a-afea2641760c.png)

点击api秘钥, 然后创建一个apikey.

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764642223406-e9f9478b-ad27-4943-a85b-9a038edb7d40.png)

初次使用apikey上会有一个提示`**设置结算信息**`

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764642323191-d609bbe4-ea32-4de2-8207-74949668af4f.png)

点击之后进行绑卡

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764642361260-7628434a-c45b-499e-9207-16cbffd4bd9c.png)

我使用的是招商银行的万事达卡, 应该只要是支持境外支付的信用卡就可以, 没有的话可以联系你常用的银行办理即可.

![](https://cdn.nlark.com/yuque/0/2025/jpeg/28087079/1764642594202-9be4dabf-aa70-45e7-b5aa-3e5ad96117a9.jpeg)

绑定的时候会让选择地区, 没有对大陆的选项, 只有选择国内香港然后随便填写一个地址即可.

绑定成功之后可以在Google cloud中看到赠送金 `**300 美金 / 90 天**`.

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764642768781-be5adc0b-497a-4ea7-9c37-d6ec9891be11.png)

这里不知道是不是bug, 我绑定的是香港所以发放的应该是港币金额, 换算下来刚好300$ , 如果真的是2000多刀, 那谷歌真的是大善人了.

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764640710836-594dc2f2-4399-496c-80b9-9fae8ac26da0.png)

到这里就OK了, 后续直接在aistudio使用对应的apikey就可以正常开发了.

## 使用Gemini3
现在好像默认打开gemini就是试用最新的gemini3 pro的模型

[https://gemini.google.com/app](https://gemini.google.com/app)  
![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764643089478-1bbb4154-3007-4e99-a9b4-a613f58a0545.png)

这里一般就是应用快捷方式的使用, 一般使用已经够了, 但是这样并不能发挥gemini的强大功能. 

推荐使用方式是在 `aistudio` 中使用: [https://aistudio.google.com/](https://aistudio.google.com/)

aistudio类似一个实验室, 支持开发各种api的组合应用, 可以最大程度发挥出gemini3 的能力.

1. 首先创建一个项目的秘钥:

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764644089846-d19007bb-2c4f-48d6-9aed-91bfeaefcc54.png)

2. 点击进入build环境, 这里可以组合api功能, 也可以直接打通项目push到自己的github

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764643650280-0a037a0a-1be2-4b04-876b-c81f5e24551c.png)

3. 在进入build然后开始配置你需要的api, 然后开发即可.

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764643839708-207b4294-2b01-4761-823a-0e7e179d30cd.png)

开发完成可以push到github, 也可以直接部署到Google cloud

![alt text](ceni-script.gif)



