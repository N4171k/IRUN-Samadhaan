import * as React from "react";
import { cn } from "@/lib/utils";

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "fixed bottom-4 right-4 w-96 rounded-lg border p-4 shadow-lg transition-all",
        variant === "default" && "bg-white text-gray-900",
        variant === "destructive" && "border-red-500 bg-red-50 text-red-900",
        variant === "warning" && "border-yellow-500 bg-yellow-50 text-yellow-900",
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-1 text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-2", className)}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export { Toast, ToastTitle, ToastDescription, ToastAction };