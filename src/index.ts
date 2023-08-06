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
      if (textArr[0] === '/llm' && textArr.length > 1) {
        log.info('管理员或管理群消息', talkerName, topic)
        const res: MessageActions = await messageStructuring(text.replace('/llm', ''))
        log.info('LLM识别结果:', JSON.stringify(res))

        if (res.actions.length) {
          const textMsg:Action|undefined = res.actions[0]
          const successList = []
          const failList = []
          if (textMsg?.actionType === 'sendMessage' && textMsg.event.contacts.length) {
            const relpText = textMsg.event.text + `\n————From:${msg.talker().name()}`
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
            if (contacts.length === successList.length) {
              await msg.say(`全部发送成功[${successList.length}]：${successList.join('、')}`)
            } else if (contacts.length === failList.length) {
              await msg.say(`全部发送失败[${failList.length}]：${failList.join('、')}`)
            } else {
              await msg.say(`发送成功[${successList.length}/${contacts.length}]：${successList.join('、')}\n发送失败[${failList.length}/${contacts.length}]：${failList.join('、')}`)
            }
          }
          if (textMsg?.actionType === 'sendRoomMessage' && textMsg.event.rooms.length) {
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

            if (rooms.length === successList.length) {
              await msg.say(`全部发送成功[${successList.length}]：${successList.join('、')}`)
            } else if (rooms.length === failList.length) {
              await msg.say(`全部发送失败[${failList.length}]：${failList.join('、')}`)
            } else {
              await msg.say(`发送成功[${successList.length}/${rooms.length}]：${successList.join('、')}\n发送失败[${failList.length}/${rooms.length}]：${failList.join('、')}`)
            }
          }
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
