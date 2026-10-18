import { Link } from 'react-router-dom'
import Icon from './Icon'

// A clearly visible "back" button: a pill with an arrow, white on the navy page headers, navy outline on light pages.
function BackButton({ to, label, onDark = false }: { to: string; label: string; onDark?: boolean }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 h-10 ps-3 pe-4 rounded-full text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        onDark
          ? 'bg-white text-[#14213D] hover:bg-gray-100 focus-visible:outline-white'
          : 'border-2 border-[#14213D] bg-white text-[#14213D] hover:bg-[#14213D] hover:text-white focus-visible:outline-[#14213D]'
      }`}
    >
      <Icon name="chevronLeft" size={18} className="rtl:rotate-180" />
      {label}
    </Link>
  )
}

export default BackButton
