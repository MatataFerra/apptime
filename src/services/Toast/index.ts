import { CSSClassNames } from "@/types";

import { type ToastActionElement } from "@/components/ui/Toast/toast";
import { toast } from "@/components/ui/Toast/use-toast";

import { cn } from "@/utils/helpers/styleMerger";

/** Toast types; each one picks the icon shown on the toast card. */
type ToastType = "success" | "error" | "warning" | "info" | "plain" | "loading";

export interface ToastOptions {
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  classes?: CSSClassNames;
  action?: ToastActionElement;
  itemID?: string;
  onAnimationEnd?: () => void;
}

class Toast implements ToastOptions {
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  classes?: CSSClassNames;
  action?: ToastActionElement;
  itemID?: string;
  onAnimationEnd?: () => void;

  constructor(options: ToastOptions) {
    this.type = options.type;
    this.action = options.action;
    this.itemID = options.itemID;
    this.message = options.message;
    this.classes = options.classes;
    this.duration = options.duration;
    this.description = options.description;
    this.onAnimationEnd = options.onAnimationEnd;
  }

  show() {
    toast({
      title: this.message,
      itemID: this.itemID,
      action: this.action,
      description: this.description,
      duration: this.duration ?? 3000,
      onAnimationEnd: this.onAnimationEnd,
      variant: this.type,
      className: cn(this.classes),
    });
  }
}

function showToast(options: ToastOptions) {
  new Toast(options).show();
}

export default showToast;
