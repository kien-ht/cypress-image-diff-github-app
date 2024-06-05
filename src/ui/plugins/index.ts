import type { App } from 'vue'

import globalMethods from './global-methods'

export default {
  install(app: App) {
    app.use(globalMethods)
  }
}
