"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
}

const CustomSwitch = React.forwardRef<HTMLInputElement, CustomSwitchProps>(
  ({ className, label, labelClassName, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "w-9 h-5 bg-customgreys-dirtyGrey rounded-full peer",
              "peer-checked:bg-primary-700",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-700",
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
              "after:bg-white after:rounded-full after:h-4 after:w-4",
              "after:transition-all peer-checked:after:translate-x-4",
              className
            )}
          />
        </label>
        {label && (
          <span className={cn("text-sm font-medium", labelClassName)}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

CustomSwitch.displayName = "CustomSwitch";

export { CustomSwitch }; 