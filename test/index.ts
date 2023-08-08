#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 *  - https://github.com/atorber/type-wechaty
 */
import 'dotenv/config.js'

import {
  log,
}                  from 'wechaty'

import { messageStructuring } from '../src/api/message.js'
import type { MessageActions, Action } from '../src/types/messageActionsSchema'

async function onMessage (text:string) {
  // 获取传递的参数（排除前两个元素）
  const textArgs = process.argv.slice(2)[0] as string
  text = textArgs || text
  if (text) {
    log.info('text:', text)
    if (text[0] === '/') {
      const textArr = text.split(' ')
      if (textArr.length) {
        const cmd = textArr[0]
        if (cmd === '/llm' && textArr.length > 1) {
          const res: MessageActions = await messageStructuring(text.replace('/llm', ''))
          log.info('LLM识别结果:', JSON.stringify(res))
          if (res.actions.length) {
            const textMsg:Action|undefined = res.actions[0]
            log.info('messageStructuring:', JSON.stringify(textMsg, undefined, 2))
          }
        }
      }
    } else {
      log.info('text:', '缺少参数')
    }
  }
}

onMessage('/llm 今天是星期几')
  .catch(e => {
    log.error('报错了：', e)
  })
