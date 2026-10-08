import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../router'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  const { target } = event.currentTarget
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!target || target === '_self') &&
    !event.currentTarget.hasAttribute('download')
  )
}

/** Internal link with a real href: in-app navigation for plain clicks, native behavior otherwise. */
export function Link({ to, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (!isPlainClick(event)) return
        event.preventDefault()
        navigate(to)
      }}
    />
  )
}
