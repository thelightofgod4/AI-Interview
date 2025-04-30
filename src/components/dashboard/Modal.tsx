import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  size?: "default" | "large";
}

export default function Modal({
  open,
  onClose,
  closeOnOutsideClick = true,
  children,
  size = "default",
}: ModalProps) {
  const sizeClasses = {
    default: "max-w-lg",
    large: "max-w-4xl"
  };

  return (
    <div
      className={`fixed z-50 inset-0 flex justify-center items-center transition-colors overflow-y-auto px-4 py-6 sm:px-6
      ${open ? "visible bg-black/30" : "invisible"}
      `}
      onClick={closeOnOutsideClick ? onClose : () => {}}
    >
      <div
        className={`bg-white rounded-xl shadow p-4 sm:p-6 transition-all w-full ${sizeClasses[size]} mx-auto relative
        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 p-2 rounded-lg text-gray-400 bg-white hover:text-gray-600 z-10"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
