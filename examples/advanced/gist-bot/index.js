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

import {
  config,
  Wechaty,
  log,
}           from 'wechaty'

import { onMessage }      from './on-message.js'
import { onFriendship }   from './on-friend.js'
import { onRoomJoin }     from './on-room-join.js'

import qrTerm from 'qrcode-terminal'

const welcome = `
=============== Powered by Wechaty ===============
-------- https://github.com/Chatie/wechaty --------

Please wait... I'm trying to login in...

`
console.info(welcome)

const bot = Wechaty.instance({ profile: config.default.DEFAULT_PROFILE })

bot
  .on('scan', (qrcode, status) => {
    qrTerm.generate(qrcode)
    console.info(`${qrcode}\n[${status}] Scan QR Code in above url to login: `)
  })

  .on('login', async function (user) {
    log.info('Bot', `${user.name()} logined`)
    await this.say(`wechaty logined`)
  })

  .on('logout',     user => log.info('Bot', `${user.name()} logouted`))
  .on('error',      error => log.info('Bot', 'error: %s', error))

  .on('message',    onMessage)
  .on('friendship', onFriendship)
  .on('room-join',  onRoomJoin)

  .start()
  .catch(e => console.error(e))
