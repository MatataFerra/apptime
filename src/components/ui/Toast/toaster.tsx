"use client";

import {
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  type LucideIcon,
  TriangleAlert,
} from "lucide-react";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  type ToastTone,
  ToastViewport,
} from "@/components/ui/Toast/toast";
import { useToast } from "@/components/ui/Toast/use-toast";

import { cn } from "@/utils/helpers/styleMerger";

const ICONS: Partial<Record<ToastTone, { icon: LucideIcon; classes: string }>> = {
  success: { icon: CircleCheck, classes: "bg-live/15 text-live" },
  error: { icon: CircleAlert, classes: "bg-destructive-bright/15 text-destructive-bright" },
  destructive: { icon: CircleAlert, classes: "bg-destructive-bright/15 text-destructive-bright" },
  warning: { icon: TriangleAlert, classes: "bg-fast-bright/15 text-fast-bright" },
  info: { icon: Info, classes: "bg-insight-bright/15 text-insight-bright" },
  loading: { icon: LoaderCircle, classes: "bg-white/10 text-ink-inverse [&>svg]:animate-spin" },
};

export default function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="down">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const tone = ICONS[variant ?? "default"];
        const Icon = tone?.icon;

        return (
          <Toast
            key={id}
            variant={variant}
            data-type={variant ?? "default"}
            {...props}
            role={variant === "error" || variant === "destructive" ? "alert" : "status"}
          >
            {Icon ? (
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  tone.classes
                )}
              >
                <Icon className="size-5" strokeWidth={2} />
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
