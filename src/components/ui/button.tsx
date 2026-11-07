import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// The one button of the site (shadcn/ui pattern, in the Ronda2Go colours): every call to action uses it, so they share
// one height scale, one weight, one radius, the same hover, press and keyboard focus. `asChild` styles a Link instead.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-bold transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BD8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[#222D52] text-white shadow-[0_8px_20px_-8px_rgb(34_45_82/0.55)] hover:bg-[#18203D] hover:shadow-[0_12px_24px_-10px_rgb(34_45_82/0.6)]',
        accent: 'bg-[#2F6BD8] text-white shadow-[0_8px_20px_-8px_rgb(47_107_216/0.6)] hover:bg-[#2559B8]',
        outline: 'border border-[#D3DCE7] bg-white text-[#222D52] hover:border-[#222D52]/40 hover:bg-[#F2F6FB]',
        light: 'bg-white text-[#222D52] shadow-[0_8px_20px_-10px_rgb(0_0_0/0.35)] hover:bg-[#EAF1FB]',
        glass: 'border border-white/25 bg-white/10 text-white backdrop-blur-xl hover:bg-white hover:text-[#222D52]',
        ghost: 'text-[#222D52] hover:bg-[#F2F6FB]',
        link: 'rounded-none px-0 text-[#2559B8] underline underline-offset-4 hover:text-[#222D52] active:scale-100',
      },
      size: {
        sm: 'h-9 px-4 text-[13px]',
        default: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-[15px]',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
