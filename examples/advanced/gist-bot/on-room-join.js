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
  Contact,
  Room,
  Wechaty,
}             from 'wechaty'

async function onRoomJoin (
  room,
  inviteeList,
  inviter,
) {
  try {
    const inviteeName = inviteeList.map(c => c.name()).join(', ')
    /********************************************
     *
     * 从这里开始修改 vvvvvvvvvvvv
     *
     */

    if (await room.topic() !== 'ding') {
      await this.say('Room ' + await room.topic()
                      + ' got new memeber ' + inviteeName
                      + ' invited by ' + inviter.name(),
      )
      return
    }

    const inviterIsMyself = inviter.self()

    if (inviterIsMyself) {
      await room.say('Welcome to my room: ' + inviteeName)
      return
    }

    await room.say('请勿私自拉人。需要拉人请加我', inviter)
    await room.say('请先加我好友，然后我来拉你入群。先把你移出啦。', inviteeList)

    inviteeList.forEach(async c => {
      await room.del(c)
    })

    /**
     *
     * 到这里结束修改^^^^^^^^^^^^
     *
     */
    /*********************************************/

  } catch (e) {
    console.info(e)
  }

}

module.exports = {
  default: onRoomJoin,
  onRoomJoin,
}
