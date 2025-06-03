import React, { ReactNode } from "react";

interface CustomFixedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const CustomModal = ({ isOpen, onClose, children }: CustomFixedModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="custom-modal__overlay" onClick={onClose} />
      <div className="custom-modal__content">
        <div className="custom-modal__inner">{children}</div>
      </div>
    </>
  );
};

export default CustomModal;
