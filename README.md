# Type Wechaty

## 简介

使用LLM控制wechaty机器人执行各种命令，wechaty+ [typechat](https://github.com/microsoft/TypeChat) 的结合，可是实现以下功能：

- 使用自然语言给指定好友或群发消息

- ...

更多功能期待一起探索和贡献代码

## 快速开始

1. 在配置.env文件中配置相关信息

```.env
OPENAI_API_KEY=ADD_YOUR_VALUE
OPENAI_API_BASE_URL=https://api.openai.com
OPENAI_ENDPOINT=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-3.5-turbo
ADMIN_ROOM_TOPIC=ADD_YOUR_VALUE #管理群名称，在此群发消息时才会触发LLM回复
ADMIN_WX=ADD_YOUR_VALUE # 管理员微信昵称，管理员向发消息时才会触发LLM回复
WECHATY_PUPPET=wechaty-puppet-wechat
WECHATY_TOKEN=
```

2. 安装依赖及运行程序

```
npm i
npm run start
```

3. 扫码登录后在管理员群内发消息

```
/llm 通知 张三：下午3点到会议室开会

/llm 通知 全员群：全体员工下午3点会议室开会
```

## 更新记录
### v0.0.1 (Jan 12, 2017)

Init version
