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
  Friendship,
  Wechaty,
  // Room,
}                 from 'wechaty'

async function onFriendship (
  request,
) {
  try {
    const contact = request.contact()

    if (request.type() === Friendship.Type.Confirm) {
      console.info('New friend ' + contact.name() + ' relationship confirmed!')
      return
    }

    /********************************************
     *
     * 从这里开始修改 vvvvvvvvvvvv
     *
     */
    await request.accept()

    setTimeout(
      async _ => {
        await contact.say('thank you for adding me')
      },
      3000,
    )

    if (request.hello() === 'ding') {
      const myRoom = await this.Room.find({ topic: 'ding' })
      if (!myRoom) return
      setTimeout(
        async _ => {
          await myRoom.add(contact)
          await myRoom.say('welcome ' + contact.name())
        },
        3000,
      )
    }

    /**
     *
     * 到这里结束修改 ^^^^^^^^^^^^
     *
     */
    /*******************************************/
  } catch (e) {
    console.info(e)
  }
}

module.exports = {
  default: onFriendship,
  onFriendship,
}
