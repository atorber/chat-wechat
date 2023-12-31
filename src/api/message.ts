import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as dotenv from 'dotenv'
import { log } from 'wechaty'

import { createLanguageModel, createJsonTranslator } from 'typechat'
import type { MessageActions } from '../types/messageActionsSchema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// TODO: use local .env file.
dotenv.config({ path: path.join(__dirname, '../../.env') })
log.info('env', process.env)

const model = createLanguageModel(process.env)
const schema = fs.readFileSync('src/types/messageActionsSchema.ts', 'utf8')
const translator = createJsonTranslator<MessageActions>(model, schema, 'MessageActions')
translator.validator.stripNulls = true

// Process requests interactively or from the input file specified on the command line
export const messageStructuring = async (text: string) => {
  const response: any = await translator.translate(text)
  log.info('messageStructuring:', JSON.stringify(response, undefined, 2))
  if (!response.success) {
    log.info('messageStructuring 请求失败：\n', response.message)
    return response
  }
  const messageActions = response.data
  // log.info('结构化数据：\n', JSON.stringify(messageActions, undefined, 2))
  if (messageActions.actions.some((item: { actionType: string }) => item.actionType === 'unknown')) {
    log.info('语义无匹配：\n', "I didn't understand the following:")
    for (const action of messageActions.actions) {
      if (action.actionType === 'unknown') log.info('未匹配到类型：\n', action.text)
    }
    return messageActions
  }
  return messageActions
}
