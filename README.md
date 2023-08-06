# Type Wechaty

## 简介

使用LLM控制wechaty机器人执行各种命令，wechaty+ [typechat](https://github.com/microsoft/TypeChat) 的结合，可是实现以下功能：

- 使用自然语言给指定好友或群发消息（如果你是一个日常需要协调和安排各种不同的人或群的角色，这将非常有帮助）

- ...

更多功能期待一起探索和贡献代码

## 快速开始

1. 重命名.env.example为.env,配置.env文件中相关信息

```.env
OPENAI_API_KEY=sk-xxxxxxxxxxxx # 你的openai api key
OPENAI_API_BASE_URL=https://api.openai.com # 你的openai请求地址
OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions # 你的openai接入点
OPENAI_MODEL=gpt-3.5-turbo # 使用的openai模型
ADMIN_ROOM=管理员专属群 # 管理群名称，在此群发消息时才会触发LLM指令，与ADMIN_WX至少配置一项
ADMIN_WX=李四 # 管理员微信昵称，管理员向发消息时才会触发LLM指令，一般是你另一个微信的昵称，与ADMIN_ROOM至少配置一项
```

> 国内可以购买到的openai api服务推荐 [传送门](https://www.yuque.com/atorber/oegota/rs4uk3geb4amurwb)

2. 安装依赖及运行程序

```
npm i
npm run start
```

3. 扫码登录后在管理员群内发消息或使用管理员微信向机器人发消息

以 /llm 开头的指令会被识别为控制机器人，控制指令示例：

```
/llm 通知【超哥3、大师、大李】：马上来开会，带笔记本

/llm 通知 张三：下午3点到会议室开会

/llm 通知 张三、李四：下午3点到会议室开会

/llm 通知群【瓦力是群主、Moments、全员群】:全体成员到到会议室开会

/llm 通知群 Moments：全体员工下午1点到公司开会
```

> 将好友备注为实际姓名或不容易记混淆的名字，将会极大的提升准确率

## 效果

- 控制机器人向指定好友发消息

TBD

- 控制机器人向指定群发消息

TBD

## 更新记录
### v0.0.1 (Jan 12, 2017)

Init version

## 更多

推荐了解微软出品的探索性项目 [typechat](https://github.com/microsoft/TypeChat)
