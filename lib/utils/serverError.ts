export class ServerError extends Error {
  response: any
  constructor(response: any) {
    super(`Server returned error: ${response.data?.message}<br/>Code: ${response.data?.error_code}`)
    try {
      this.response = JSON.stringify(response)
    } catch (e) {
      this.response = response
    }
  }
}

export function throwIfNotSuccess(response: any) {
  if (response.result != 'success') {
    if (response.data?.error_code == 'FORBIDDEN_COUNTRY') {
      import('../../views/unsupported-region.js').then(() => {
        document.body.appendChild(document.createElement('x-unsupported-region'))
      })
    } else throw new ServerError(response)
  }
  return response
}
