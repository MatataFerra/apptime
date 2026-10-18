import { CSSClassNames } from "@/types";

import { type ToastActionElement } from "@/components/ui/Toast/toast";
import { toast } from "@/components/ui/Toast/use-toast";

import { cn } from "@/utils/helpers/styleMerger";

const TOAST_STYLE = {
  success: "bg-linear-to-r from-green-400 to-teal-500 text-slate-800",
  error: "bg-linear-to-r from-red-400 to-pink-500 text-white",
  warning: "bg-linear-to-r from-yellow-400 to-amber-500 text-slate-800",
  info: "bg-linear-to-r from-sky-400 to-cyan-600 text-white",
  plain: "bg-white text-gray-700",
} as const;

export interface ToastOptions {
  type: keyof typeof TOAST_STYLE;
  message: string;
  description?: string;
  duration?: number;
  classes?: CSSClassNames;
  action?: ToastActionElement;
  itemID?: string;
  onAnimationEnd?: () => void;
}

class Toast implements ToastOptions {
  type: keyof typeof TOAST_STYLE;
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

  private get toastStyle() {
    return TOAST_STYLE[this.type];
  }

  show() {
    toast({
      title: this.message,
      itemID: this.itemID,
      action: this.action,
      description: this.description,
      duration: this.duration ?? 3000,
      onAnimationEnd: this.onAnimationEnd,
      className: cn(this.toastStyle, this.classes),
    });
  }
}

function showToast(options: ToastOptions) {
  new Toast(options).show();
}

export default showToast;
