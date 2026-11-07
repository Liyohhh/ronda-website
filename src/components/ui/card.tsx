import * as React from 'react'
import { cn } from '@/lib/utils'

// The one card surface of the site (shadcn/ui pattern): same radius, border, shadow and padding everywhere.
// `interactive` cards lift a little on hover and press in on tap. cardClass / cardHover style a Link or section the same.
const cardClass = 'rounded-[24px] border border-[#E3E9F1] bg-white p-5 shadow-[0_18px_40px_-30px_rgb(34_45_82/0.45)] sm:p-6'
const cardHover = 'transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-[#C9D5E6] hover:shadow-[0_24px_48px_-28px_rgb(34_45_82/0.5)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0'

type CardProps = React.ComponentProps<'div'> & { interactive?: boolean }

function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardClass, interactive && cardHover, className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={cn('text-[17px] font-extrabold leading-snug text-[#222D52]', className)} {...props} />
}

function CardText({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-text" className={cn('mt-1.5 text-sm leading-relaxed text-[#5B6576]', className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Card, CardTitle, CardText, cardClass, cardHover }
