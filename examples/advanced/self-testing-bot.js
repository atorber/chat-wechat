/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import path  from 'path'

/* tslint:disable:variable-name */
import qrTerm      from 'qrcode-terminal'
import { FileBox } from 'file-box'

import {
  Wechaty,
  log,
}               from 'wechaty'

const BOT_QR_CODE_IMAGE_FILE_BOX = FileBox
  .fromUrl('https://wechaty.js.org/img/friday-qrcode.svg')

const bot = Wechaty.instance()

const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/

=============== Powered by Wechaty ===============
-------- https://github.com/chatie/wechaty --------
                Version: ${bot.version(true)}

I'm a bot, my superpower is talk in Wechat.

If you send me a 'ding', I will reply you a 'dong'!
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me to more superpowers!

Please wait... I'm trying to login in...

`

console.log(welcome)

bot
.on('logout'	, user => log.info('Bot', `${user.name()} logouted`))
.on('login'	  , user => {
  log.info('Bot', `${user.name()} login`)
  bot.say('Wechaty login').catch(console.error)
})
.on('scan', (qrcode, status) => {
  qrTerm.generate(qrcode, { small: true })
  console.log(`${qrcode}\n[${status}] Scan QR Code in above url to login: `)
})
.on('message', async msg => {
  const from = msg.from()

  if (!from) {
    log.info('Bot', 'on(message) skip no-from() message: %s', msg)
    return
  }

  if (msg.type() !== bot.Message.Type.Text) {
    log.info('Bot', 'on(message) skip non-text message: %s', msg)
    return
  }

  if (msg.age() > 60) {
    log.info('Bot', 'on(message) skip message older(%d) than 60 seconds: %s', msg.age(), msg)
    return
  }

  try {
    console.log(msg.toString()) // on(message) exception: Error: no file
    const text = msg.text()

    // Room.findAll()
    if (/^testRoom$/i.test(text)) {
      const roomList = await bot.Room.findAll()
      const topicList = await Promise.all(
        roomList.map(async room => await room.topic()),
      )

      const totalNum = roomList.length
      let   n        = 0

      const replyText = [
        `Total room number: ${totalNum}`,
        ...topicList
            .slice(0, 17)
            .map(topic => ++n + '. ' + topic),
      ].join('\n')

      await msg.say(replyText)

      return
    }

    // Contact.findAll()
    if (/^testContact$/i.test(text)) {
      const contactList = await bot.Contact.findAll()
      console.log('bot.Contact.findAll() done.')

      const totalNum = contactList.length
      let n = 0

      const replyText = [
        `Total contact number: ${totalNum}`,
        contactList
          .slice(0, 17)
          .map(contact => contact.name())
          .map(name => ++n + '. ' + name),
      ].join('\n')

      await from.say(replyText)

      return
    }

    if (/^fcontact$/.test(text)) {
      console.log('begin to check msg forward contact')
      // const contact = await bot.Contact.find({
      //   name: /李佳芮/,
      // })
      const contact = await bot.Contact.load('qq512436430')
      if (!contact) {
        console.error('contact not found')
        return
      }
      await msg.forward(contact)
      return
    }

    if (/^froom$/.test(text)) {
      console.log('begin to check msg forward room')
      const dingRoom = await bot.Room.find({ topic: /^ding/i })
      if (dingRoom) {
        await msg.forward(dingRoom)
      } else {
        await msg.say('Cannot find dingRoom, please create a ding room first!')
      }
      return
    }

    if (/^geta$/.test(text)) {
      console.log('begin to check get contact alias')
      await from.say(from.alias() || 'no alias')
      return
    }

    if (/^seta$/.test(text)) {
      console.log('begin to check set contact alias')
      await from.alias('wechaty-alias')
      setTimeout(async () => {
        await from.say(from.alias() || 'no alais')
      }, 3 * 1000)
      return
    }

    if (/^avatar$/.test(text)) {
      console.log('begin to check get contact avatar')
      const file = await from.avatar()
      await from.say(file)
      return
    }

    if (/^(ding|ping|bing|code)$/i.test(msg.text()) /*&& !msg.self()*/) {
      /**
       * 1. reply 'dong'
       */
      log.info('Bot', 'REPLY: dong')
      await msg.say('dong')

      const joinWechaty =  `Join Wechaty Developers' Community\n\n` +
                            `Wechaty is used in many ChatBot projects by hundreds of developers.\n\n` +
                            `If you want to talk with other developers, just scan the following QR Code in WeChat with secret code: wechaty,\n\n` +
                            `you can join our Wechaty Developers' Home at once`
      await msg.say(joinWechaty)

      /**
       * 2. reply qrcode image
       */
      // const fileBox = FileBox.packStream(
      //   fs.createReadStream(BOT_QR_CODE_IMAGE_FILE),
      //   BOT_QR_CODE_IMAGE_FILE,
      // )

      log.info('Bot', 'REPLY: %s', BOT_QR_CODE_IMAGE_FILE_BOX)
      await msg.say(BOT_QR_CODE_IMAGE_FILE_BOX)

      /**
       * 3. reply 'scan now!'
       */
      await msg.say('Scan now, because other Wechaty developers want to talk with you too!\n\n(secret code: wechaty)')

    }
  } catch (e) {
    log.error('Bot', 'on(message) exception: %s' , e)
    console.error(e)
  }
})

bot.on('error', async e => {
  log.error('Bot', 'error: %s', e)
  if (bot.logonoff()) {
    await bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  // await bot.stop()
})

// let killChrome: NodeJS.SignalsListener

bot.start()
.then(() => {
  const listenerList = process.listeners('SIGINT')
  for (const listener of listenerList) {
    if (listener.name === 'killChrome') {
      process.removeListener('SIGINT', listener)
      // killChrome = listener
    }
  }
})
.catch(async e => {
  log.error('Bot', 'start() fail: %s', e)
  await bot.stop()
  process.exit(-1)
})

// let quiting = false
// finis((code, signal) => {
//   log.info('Bot', 'finis(%s, %s)', code, signal)

//   if (!bot.logonoff()) {
//     log.info('Bot', 'finis() bot had been already stopped')
//     doExit(code)
//   }

//   if (quiting) {
//     log.warn('Bot', 'finis() already quiting... return and wait...')
//     return
//   }

//   quiting = true
//   let done = false
//   // let checkNum = 0

//   const exitMsg = `Wechaty will exit ${code} because of ${signal} `

//   log.info('Bot', 'finis() broadcast quiting message for bot')
//   bot.say(exitMsg)
//       // .then(() => bot.stop())
//       .catch(e => log.error('Bot', 'finis() catch rejection: %s', e))
//       .then(() => done = true)

//   setImmediate(checkForExit)

//   function checkForExit() {
//     // if (checkNum++ % 100 === 0) {
//     log.info('Bot', 'finis() checkForExit() checking done: %s', done)
//     // }
//     if (done) {
//       log.info('Bot', 'finis() checkForExit() done!')
//       setTimeout(() => doExit(code), 1000)  // delay 1 second
//       return
//     }
//     // death loop to wait for `done`
//     // process.nextTick(checkForExit)
//     // setImmediate(checkForExit)
//     setTimeout(checkForExit, 100)
//   }
// })

// function doExit(code: number): void {
//   log.info('Bot', 'doExit(%d)', code)
//   if (killChrome) {
//     killChrome('SIGINT')
//   }
//   process.exit(code)
// }

// process.on('SIGINT', function() {
//   console.log('Nice SIGINT-handler')
//   const listeners = process.listeners('SIGINT')
//   for (let i = 0; i < listeners.length; i++) {
//       console.log(listeners[i].toString())
//   }
// })
