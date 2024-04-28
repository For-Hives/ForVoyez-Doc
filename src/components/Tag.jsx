import clsx from 'clsx'

const variantStyles = {
  small: '',
  medium: 'rounded-lg px-1.5 ring-1 ring-inset',
}

const colorStyles = {
  forvoyez_orange: {
    small: 'text-forvoyez_orange-500',
    medium:
      'ring-forvoyez_orange-300bg-forvoyez_orange-400/10 text-forvoyez_orange-500',
  },
  sky: {
    small: 'text-sky-500',
    medium:
      'ring-sky-300 bg-sky-400/10 text-sky-500',
  },
  amber: {
    small: 'text-amber-500',
    medium:
      'ring-amber-300 bg-amber-400/10 text-amber-500',
  },
  rose: {
    small: 'text-red-500',
    medium:
      'ring-rose-200 bg-rose-50 text-red-500',
  },
  slate: {
    small: 'text-slate-400',
    medium:
      'ring-slate-200 bg-slate-50 text-slate-500',
  },
}

const valueColorMap = {
  GET: 'forvoyez_orange',
  POST: 'sky',
  PUT: 'amber',
  DELETE: 'rose',
}

export function Tag({
  children,
  variant = 'medium',
  color = valueColorMap[children] ?? 'forvoyez_orange',
}) {
  return (
    <span
      className={clsx(
        'font-mono text-[0.625rem] font-semibold leading-6',
        variantStyles[variant],
        colorStyles[color][variant],
      )}
    >
      {children}
    </span>
  )
}
