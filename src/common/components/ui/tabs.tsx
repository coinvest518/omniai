"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "yesinline-flex yesh-10 yesitems-center yesjustify-center yesrounded-md yesbg-slate-100 yesp-1 yestext-slate-500 dark:yesbg-slate-800 dark:yestext-slate-400",
      className || ""
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "yesinline-flex yesitems-center yesjustify-center yeswhitespace-nowrap yesrounded-sm yespx-3 yespy-1.5 yestext-sm yesfont-medium yesring-offset-white yestransition-all focus-visible:yesoutline-none focus-visible:yesring-2 focus-visible:yesring-slate-950 focus-visible:yesring-offset-2 disabled:yespointer-events-none disabled:yesopacity-50 data-[state=active]:yesbg-white data-[state=active]:yestext-slate-950 data-[state=active]:yesshadow-sm dark:yesring-offset-slate-950 dark:focus-visible:yesring-slate-300 dark:data-[state=active]:yesbg-slate-950 dark:data-[state=active]:yestext-slate-50",
      className || ""
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "yesmt-2 yesring-offset-white focus-visible:yesoutline-none focus-visible:yesring-2 focus-visible:yesring-slate-950 focus-visible:yesring-offset-2 dark:yesring-offset-slate-950 dark:focus-visible:yesring-slate-300",
      className || ""
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
