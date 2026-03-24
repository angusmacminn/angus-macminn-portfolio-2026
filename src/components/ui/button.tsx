import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import './button.scss'

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'clear' | 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps
  extends React.ComponentProps<'button'> {
  asChild?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(
        'ui-button',
        `ui-button--${variant || 'default'}`,
        `ui-button--${size || 'default'}`,
        className,
      )}
      {...props}
    />
  )
}

export { Button }
