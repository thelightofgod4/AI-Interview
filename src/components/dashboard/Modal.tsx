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
        className={`bg-white rounded-xl shadow p-6 transition-all
        ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-white hover:text-gray-600"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}
