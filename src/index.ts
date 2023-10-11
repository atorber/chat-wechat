#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 *  - https://github.com/atorber/type-wechaty
 */
import 'dotenv/config.js'

import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
}                  from 'wechaty'

import qrcodeTerminal from 'qrcode-terminal'

import { messageStructuring } from './api/message.js'
import type { MessageActions, Action } from './types/messageActionsSchema'

const bot = WechatyBuilder.build({
  name: 'type-wechaty',
  puppet: 'wechaty-puppet-wechat4u',
  puppetOptions: {
    uos: true,
  },
})

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage (msg: Message) {
  log.info('StarterBot', msg.toString())
  const text = msg.text()
  const talker = msg.talker()
  const talkerName = talker.name()
  const room = msg.room()
  const topic = await room?.topic()
  const ADMIN_WX_NAME =  process.env['ADMIN_WX_NAME']
  const ADMIN_ROOM_TOPIC =  process.env['ADMIN_ROOM_TOPIC']

  if (msg.text() === 'ding') {
    await msg.say('dong')
  }

  if (talkerName === ADMIN_WX_NAME || (topic && topic === ADMIN_ROOM_TOPIC)) {

    if (text[0] === '/') {
      const textArr = text.split(' ')
      if (textArr.length) {
        const cmd = textArr[0]
        if (cmd === '/' && textArr.length > 1) {
          log.info('管理员或管理群消息', talkerName, topic)
          const res: MessageActions = await messageStructuring(text.replace('/llm', ''))
          log.info('LLM识别结果:', JSON.stringify(res))

          if (res.actions.length) {
            const textMsg:Action|undefined = res.actions[0]
            const successList = []
            const failList = []
            if (textMsg?.actionType === 'sendMessage' && textMsg.event.contacts.length) {
              const relpText = textMsg.event.text + `\n——From：${msg.talker().name()}`
              const contacts = textMsg.event.contacts
              for (const i in contacts) {
                const curContact = contacts[i]
                let toUser = await bot.Contact.find({ alias:curContact })
                if (!toUser) {
                  toUser = await bot.Contact.find({ name:curContact })
                }
                log.info('toUser:', JSON.stringify(toUser))
                if (toUser) {
                  await toUser.say(relpText)
                  successList.push(curContact)
                } else {
                  failList.push(curContact)
                }
              }
              const timeString = new Date().toLocaleString()
              if (contacts.length === successList.length) {
                await msg.say(`${timeString}\n${talkerName} /llm >\n全部发送成功[${successList.length}]：${successList.join('、')}`)
              } else if (contacts.length === failList.length) {
                await msg.say(`${timeString}\n${talkerName} /llm >\n全部发送失败[${failList.length}]：${failList.join('、')}`)
              } else {
                await msg.say(`${timeString}\n${talkerName} /llm >\n发送成功[${successList.length}/${contacts.length}]：${successList.join('、')}\n发送失败[${failList.length}/${contacts.length}]：${failList.join('、')}`)
              }
            } else if (textMsg?.actionType === 'sendRoomMessage' && textMsg.event.rooms.length) {
              const relpText = textMsg.event.text + `\n————From:${msg.talker().name()}`
              const rooms = textMsg.event.rooms
              for (const i in rooms) {
                const curRoom = rooms[i]
                const toUser = await bot.Room.find({ topic:curRoom })

                log.info('toUser:', JSON.stringify(toUser))
                if (toUser) {
                  await toUser.say(relpText)
                  successList.push(curRoom)
                } else {
                  failList.push(curRoom)
                }
              }
              const timeString = new Date().toLocaleString()
              if (rooms.length === successList.length) {
                await msg.say(`${timeString}\n${talkerName} /llm >\n全部发送成功[${successList.length}]：${successList.join('、')}`)
              } else if (rooms.length === failList.length) {
                await msg.say(`${timeString}\n${talkerName} /llm >\n全部发送失败[${failList.length}]：${failList.join('、')}`)
              } else {
                await msg.say(`${timeString}\n${talkerName} /llm >\n发送成功[${successList.length}/${rooms.length}]：${successList.join('、')}\n发送失败[${failList.length}/${rooms.length}]：${failList.join('、')}`)
              }
            } else {
              const timeString = new Date().toLocaleString()
              await msg.say(`${timeString}\n${talkerName} /llm >\n${JSON.stringify(textMsg, undefined, 2)}`)
            }
          }
        }

        // TBD——增加退出指令，当接收到退出指令时，清空cmd
        if (cmd && [ '/esc', '/exit', '/quit' ].includes(cmd)) {
          log.info('用户输入了退出指令：', cmd)
          await msg.say(`${new Date().toLocaleString()}\n${talker.name()} / >\n输入/help查询可用操作指令`)
        }
        if (cmd && [ '/help' ].includes(cmd)) {
          log.info('用户输入了帮助指令：', cmd)
          await msg.say(`${new Date().toLocaleString()}\n${talker.name()} / >
输入以下示例内容学习如何使用，注意替换为自己的好友或群名称，格式为“/+空格+指令内容”

  / 通知【超哥3、大师、大李】：马上来开会，带笔记本

  / 通知 张三：下午3点到会议室开会\n/ 通知 张三、李四：下午3点到会议室开会

  / 通知群【瓦力是群主、Moments、全员群】:全体成员到到会议室开会

  / 通知群 Moments：全体员工下午1点到公司开会

  / 每天晚上10点提醒【大李】：该睡觉啦`)
        }
      }
    }

  } else {
    log.info('不是管理员或管理群消息', talkerName, topic)
  }
}

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
