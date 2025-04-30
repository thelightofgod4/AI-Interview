import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
}

export default function Modal({
  open,
  onClose,
  closeOnOutsideClick = true,
  children,
}: ModalProps) {
  return (
    <div
      className={`fixed z-50 inset-0 flex justify-center items-center transition-colors
      ${open ? "visible bg-black/30" : "invisible"}
      `}
      onClick={closeOnOutsideClick ? onClose : () => {}}
    >
      <div
        className={`bg-white rounded-lg shadow transition-all w-full max-w-2xl mx-auto relative p-3
        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -top-3 -right-3 p-2 rounded-full text-gray-600 bg-white hover:text-gray-800 z-10 shadow-lg border border-gray-100"
          onClick={onClose}
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        {children}
      </div>
    </div>
  );
}
