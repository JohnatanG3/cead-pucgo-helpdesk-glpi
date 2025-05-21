import type React from "react"
import "react-day-picker"

declare module "react-day-picker" {
  interface CustomComponents {
    IconLeft?: React.ComponentType<React.ComponentProps<"svg">>
    IconRight?: React.ComponentType<React.ComponentProps<"svg">>
  }
}
