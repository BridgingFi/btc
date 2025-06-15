import { retrieveLaunchParams } from '@telegram-apps/bridge'

export const tma = tryRetrieveLaunchParams()

function tryRetrieveLaunchParams() {
  try {
    return retrieveLaunchParams()
  } catch (error) {
    console.groupCollapsed('TMA launch params not found')
    console.debug(error)
    console.groupEnd()
    return undefined
  }
}

export function loadTmaSdk() {
  if (tma?.tgWebAppVersion) {
    return import('@telegram-apps/sdk')
  }
}
