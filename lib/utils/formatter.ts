import memoize from 'memoize'

function getFormatter(
  maximumFractionDigits: number,
  minimumFractionDigits: number,
  options?: Intl.NumberFormatOptions & { locale?: Intl.LocalesArgument }
) {
  return new Intl.NumberFormat(options?.locale, {
    ...options,
    maximumFractionDigits,
    minimumFractionDigits
  })
}

const memoizedGetFormattor = memoize(getFormatter, { cacheKey: (args) => args.join(',') })

export function formatNumber(
  value: number | bigint | string,
  maximumFractionDigits = 2,
  minimumFractionDigits = 0,
  options?: Intl.NumberFormatOptions & { locale?: Intl.LocalesArgument }
) {
  const num = typeof value === 'string' ? Number(value) : value
  return memoizedGetFormattor(maximumFractionDigits, minimumFractionDigits, options).format(num)
}

export function formatUSDT(value: number) {
  return formatNumber(value, value >= 1000 ? 2 : value >= 100 ? 3 : value >= 10 ? 4 : 6)
}

export function formatJetton(value: number) {
  return formatNumber(value, value >= 1000 ? 2 : value >= 100 ? 3 : value >= 10 ? 4 : value >= 0.1 ? 6 : 9)
}
