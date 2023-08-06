#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
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
  puppet: 'wechaty-puppet-wechat',
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
  if (msg.text() === 'ding') {
    await msg.say('dong')
  }
  if (text[0] === '/') {
    const textArr = text.split(' ')
    if (textArr[0] === '/llm') {
      const res: MessageActions = await messageStructuring(msg.text())
      log.info('res:', JSON.stringify(res))
      if (res.actions.length) {
        const textMsg:Action|undefined = res.actions[0]
        if (textMsg?.actionType === 'sendMessage') {
          let toUser = await bot.Contact.find({ alias:textMsg.event.contacts[0] })
          if (toUser) {
            toUser = await bot.Contact.find({ name:textMsg.event.contacts[0] })
          }
          log.info('toUser:', JSON.stringify(toUser))
          if (toUser) {
            await toUser.say(textMsg.event.text)
            await msg.say('已完成')
          } else {
            await msg.say('未找到联系人')
          }
        }
        if (textMsg?.actionType === 'sendRoomMessage') {
          const toUser = await bot.Room.find({ topic:textMsg.event.rooms[0] })
          if (toUser) {
            await toUser.say(textMsg.event.text)
            await msg.say('已完成')
          } else {
            await msg.say('未找到群')
          }
        }
      }
    }
  }
}

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
