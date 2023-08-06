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

/**
 * Wechaty bot use a ApiAi.com brain
 *
 * Apply Your Own ApiAi Developer API_KEY at:
 * http://www.api.ai
 *
 * Enjoy!
 */
/* tslint:disable:variable-name */
import QrcodeTerminal from 'qrcode-terminal'

import { Brolog as log } from 'brolog'
/* tslint:disable:no-var-requires */
// import co  from 'co'
/* tslint:disable:variable-name */
import ApiAi from 'apiai'
import { EventEmitter } from 'events'

/**
 * Change `import { ... } from '../.js'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
import {
  config,
  Wechaty,
  Message,
}           from 'wechaty'

// log.level = 'verbose'
// log.level = 'silly'

/**
 *
 * `7217d7bce18c4bcfbe04ba7bdfaf9c08` for Wechaty demo
 *
 */
const APIAI_API_KEY = '7217d7bce18c4bcfbe04ba7bdfaf9c08'
const brainApiAi = ApiAi(APIAI_API_KEY)

const bot = Wechaty.instance({ profile: config.default.DEFAULT_PROFILE })

console.log(`
Welcome to api.AI Wechaty Bot.
Api.AI Doc: https://docs.api.ai/v16/docs/get-started

Notice: This bot will only active in the room which name contains 'wechaty'.
/* if (m.room() && /Wechaty/i.test(m.room().name())) { */

Loading... please wait for QrCode Image Url and then scan to login.
`)

bot
.on('scan', (qrcode, status) => {
  QrcodeTerminal.generate(qrcode)
  console.log(`${qrcode}\n[${status}] Scan QR Code in above url to login: `)
})
.on('login'  , user => log.info('Bot', `bot login: ${user}`))
.on('logout' , user => log.info('Bot', 'bot %s logout.', user))
.on('message', async m => {
  if (m.self()) { return }

  // co(function* () {
  //   const msg = yield m.load()
  const room = m.room()

  if (room && /Wechaty/i.test(await room.topic())) {
    log.info('Bot', 'talk: %s'  , m)
    talk(m)
  } else {
    log.info('Bot', 'recv: %s'  , m)
  }
  // })
  // .catch(e => log.error('Bot', 'on message rejected: %s' , e))
})

bot.start()
.catch(async e => {
  log.error('Bot', 'init() fail:' + e)
  await bot.stop()
  process.exit(-1)
})

class Talker extends EventEmitter {
  private thinker: (text: string) => Promise<string>
  private obj: {
    text: string[],
    time: number[],
  }
  private timer?: NodeJS.Timer

  constructor(
    thinker: (text: string) => Promise<string>,
  ) {
    log.verbose('Talker()')
    super()
    this.thinker = thinker
    this.obj = {
      text: [],
      time: [],
    }
  }

  public save(text: string) {
    log.verbose('Talker', 'save(%s)', text)
    this.obj.text.push(text)
    this.obj.time.push(Date.now())
  }
  public load() {
    const text = this.obj.text.join(', ')
    log.verbose('Talker', 'load(%s)', text)
    this.obj.text = []
    this.obj.time = []
    return text
  }

  public updateTimer(delayTime?: number) {
    delayTime = delayTime || this.delayTime()
    log.verbose('Talker', 'updateTimer(%s)', delayTime)

    if (this.timer) { clearTimeout(this.timer) }
    this.timer = setTimeout(this.say.bind(this), delayTime, 3)
  }

  public hear(text: string) {
    log.verbose('Talker', `hear(${text})`)
    this.save(text)
    this.updateTimer()
  }
  public async say() {
    log.verbose('Talker', 'say()')
    const text  = this.load()
    await this.thinker(text)
    .then(reply => this.emit('say', reply))
    this.timer = undefined
  }

  public delayTime() {
    const minDelayTime = 5000
    const maxDelayTime = 15000
    const delayTime = Math.floor(Math.random() * (maxDelayTime - minDelayTime)) + minDelayTime
    return delayTime
  }
}

/* tslint:disable:variable-name */
const Talkers: {
  [index: string]: Talker,
 } = {}

function talk(m: Message) {
  const from    = m.from()
  const fromId  = from && from.id

  const room    = m.room()
  const roomId  = room && room.id

  const content = m.text()

  const talkerName = roomId + (fromId || '')
  if (!Talkers[talkerName]) {
    Talkers[talkerName] = new Talker(function(text: string) {
      return new Promise((resolve, reject) => {
        brainApiAi.textRequest(text)
        .on('response', function(response: any) {
          console.log(response)
          /*
{ id: 'a09381bb-8195-4139-b49c-a2d03ad5e014',
  timestamp: '2016-05-27T17:22:46.597Z',
  result:
   { source: 'domains',
     resolvedQuery: 'hi',
     action: 'smalltalk.greetings',
     parameters: { simplified: 'hello' },w
     metadata: {},
     fulfillment: { speech: 'Hi there.' },
     score: 0 },
  status: { code: 200, errorType: 'success' } }
          */
          const reply: string = response.result.fulfillment.speech
          if (!reply) {
            log.info('ApiAi', `Talker do not want to talk for "${text}"`)
            return reject()
          }
          log.info('ApiAi', 'Talker reply:"%s" for "%s" ', reply, text)
          return resolve(reply)
        })
        .on('error', function(error: Error) {
          log.error('ApiAi', error)
          reject(error)
        })
        .end()
      })
    })
    Talkers[talkerName].on('say', reply => m.say(reply))
  }
  Talkers[talkerName].hear(content)
}
