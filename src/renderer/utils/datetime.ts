import moment from 'moment'
import TimeFormat from '~/src/constants/timeFormat'

export const parseDatetime = (datetime: string, format: number, language: string): string => {
  switch (format) {
    case TimeFormat.Relative.value:
      moment.locale(language)
      return moment(datetime).fromNow()
    default:
      return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
  }
}
