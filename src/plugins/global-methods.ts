import dayjs from 'dayjs'
import { type App } from 'vue'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type FormatDateTimeType = 'datetime' | 'date' | 'time'

export interface GlobalMethods {
  formatDateTime: (date?: string | number, type?: FormatDateTimeType) => string
}

export default {
  install(app: App) {
    app.config.globalProperties.$G = {
      formatDateTime
    } as GlobalMethods
  }
}

export function formatDateTime(
  date?: string | number,
  type: FormatDateTimeType = 'datetime'
) {
  if (!dayjs(date).isValid()) return ''

  const patternMap: Record<FormatDateTimeType, string> = {
    datetime: `MMM DD, YYYY\nhh:mm A`,
    date: 'MMM DD, YYYY',
    time: 'hh:mm A'
  }
  return dayjs(date).format(patternMap[type])
}
