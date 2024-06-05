import dayjs from 'dayjs'
import { type App } from 'vue'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type FormatDateTimeType = 'datetime' | 'date' | 'time'

export interface GlobalMethods {
  formatDateTime: (date?: string, type?: FormatDateTimeType) => string
}

export default {
  install(app: App) {
    app.config.globalProperties.$G = {
      formatDateTime
    } as GlobalMethods
  }
}

export function formatDateTime(
  date?: string,
  type: FormatDateTimeType = 'datetime'
) {
  if (!dayjs(date).isValid()) return ''

  const patternMap: Record<FormatDateTimeType, string> = {
    datetime: `YYYY-MM-DD\nHH:mm:ss`,
    date: 'YYYY-MM-DD',
    time: 'HH:mm'
  }
  return dayjs(date).format(patternMap[type])
}
