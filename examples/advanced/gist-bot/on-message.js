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
  Message,
  Wechaty,
}             from 'wechaty'

async function onMessage(message) {
  try {
    const room      = message.room()
    const sender    = message.from()
    const content   = message.text()

    console.info((room ? '[' + await room.topic() + ']' : '')
                + '<' + (sender && sender.name()) + '>'
                + ':' + message,
    )

    if (message.self() || room) {
      console.info('message is sent from myself, or inside a room.')
      return
    }

    /********************************************
     *
     * 从下面开始修改vvvvvvvvvvvv
     *
     */
    if (!sender) return

    if (content === 'ding') {
      await message.say('thanks for ding me')

      const myRoom = await this.Room.find({ topic: 'ding' })
      if (!myRoom) return

      if (await myRoom.has(sender)) {
        await sender.say('no need to ding again, because you are already in ding room')
        return
      }

      await sender.say('ok, I will put you in ding room!')
      await myRoom.add(sender)
      return

    } else if (content === 'dong') {
      await sender.say('ok, dong me is welcome, too.')
      return
    }

    /**
     *
     * 到这里结束修改^^^^^^^^^^^^
     *
     */
    /*********************************************/
  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  default: onMessage,
  onMessage,
}
