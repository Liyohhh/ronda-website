import { ICONS, type IconName as MaterialName } from '../data/icons'
import { OPERATOR_ICONS, type OperatorIconName } from '../data/operatorIcons'

export type IconName = MaterialName | OperatorIconName
const ALL: Record<IconName, string> = { ...ICONS, ...OPERATOR_ICONS }

type Props = {
  name: IconName
  size?: number // px
  className?: string
  label?: string // spoken name; without it the icon is decorative
}

// Material Symbols icon (see scripts/fetch-icons.mjs), or the operator's own bus icons (data/operatorIcons.ts).
// Takes the text colour.
function Icon({ name, size = 20, className = '', label }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`flex-shrink-0 ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      // markup comes from our own generated file, not user input
      dangerouslySetInnerHTML={{ __html: ALL[name] }}
    />
  )
}

export default Icon
