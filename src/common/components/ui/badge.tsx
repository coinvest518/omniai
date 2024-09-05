import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "yesinline-flex yesitems-center yesrounded-full yesborder yesborder-slate-200 yespx-2.5 yespy-0.5 yestext-xs yesfont-semibold yestransition-colors focus:yesoutline-none focus:yesring-2 focus:yesring-slate-950 focus:yesring-offset-2 dark:yesborder-slate-800 dark:focus:yesring-slate-300",
  {
    variants: {
      variant: {
        default:
          "yesborder-transparent yesbg-slate-900 yestext-slate-50 hover:yesbg-slate-900/80 dark:yesbg-slate-50 dark:yestext-slate-900 dark:hover:yesbg-slate-50/80",
        secondary:
          "yesborder-transparent yesbg-slate-100 yestext-slate-900 hover:yesbg-slate-100/80 dark:yesbg-slate-800 dark:yestext-slate-50 dark:hover:yesbg-slate-800/80",
        destructive:
          "yesborder-transparent yesbg-red-500 yestext-slate-50 hover:yesbg-red-500/80 dark:yesbg-red-900 dark:yestext-slate-50 dark:hover:yesbg-red-900/80",
        outline: "yestext-slate-950 dark:yestext-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant: variant || 'default' }), className || '')} {...props} />
  )
}

export { Badge, badgeVariants }
