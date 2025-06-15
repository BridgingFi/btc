function debugLog(res: Response, result: Promise<any>) {
  if (import.meta.env.DEV)
    Promise.all([import('debug'), result]).then(([d, result]) => {
      const debugNamespace = 'lib:fetch'
      if (d.enabled(debugNamespace)) {
        console.groupCollapsed(
          `%c${debugNamespace}%c %o returns %o`,
          `color:${d.selectColor(debugNamespace)};font-weight:normal;`,
          'color:inherit;font-weight:normal;',
          new URL(res.url).pathname,
          result
        )
        console.trace('call stack') // hidden in collapsed group
        console.groupEnd()
      }
    })
}

export class FetchError extends Error {
  status: number
  constructor(res: Response, message?: string) {
    super(
      !message
        ? `Failed with status ${res.status} (${res.statusText})`
        : message.match(/<[^>]*>/)
          ? message.replace(
              /(<[\s]*head([\s\S]*?)<[\s]*\/head[\s]*>|<[\s]*style([\s\S]*?)<[\s]*\/style[\s]*>|<[\s]*script([\s\S]*?)<[\s]*\/script[\s]*>|<[^>]*>)/g,
              ''
            )
          : message
    )
    this.status = res.status
  }
}

function throwFetchError(res: Response) {
  return res.text().then((text) => {
    throw new FetchError(res, text)
  })
}

export function getJson(res: Response) {
  if (res.status != 200) return throwFetchError(res)
  const json = res.json().catch((e) => {
    console.warn(e)
    throw e
  })
  if (import.meta.env.DEV) debugLog(res, json)
  return json
}

export function getBody(res: Response) {
  if (res.status != 200) return throwFetchError(res)
  const text = res.text()
  if (import.meta.env.DEV) debugLog(res, text)
  return text
}

export function ensureSuccess(res: Response) {
  if (res.status != 200) return throwFetchError(res)
}
