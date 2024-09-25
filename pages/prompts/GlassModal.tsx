import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import './Modal.css';
import { copyToClipboard } from '~/common/util/clipboardUtils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptTitle: string;
  creditPrice: number;
  description: string;
  promptData: string;
  onPurchase: (userId: string, promptId: string) => void;
  showCopyButton: boolean;
  isPurchased?: boolean;
  promptId: string;
  userId: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  promptTitle,
  description,
  promptData,
  onPurchase,
  creditPrice,
  isPurchased,
  promptId,
  userId,
}) => {
  const { user } = useUser(); // Directly access the user
  const [localPromptData, setLocalPromptData] = useState(promptData);
  const handleCopyClick = () => {
    copyToClipboard(promptData, 'Prompt Data Copied to Clipboard!');
  };

  if (!isOpen || !user) return null; // Ensure modal doesn't open unless user is authenticated

  const handlePurchase = () => {
    onPurchase(userId, promptId); // Use Clerk's user ID directly
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{promptTitle}</h2>
        <p>Credit Price: {creditPrice}</p>
        <p>Description: {description}</p>
        <p>Prompt Data: {localPromptData}</p>
        {!isPurchased && <button onClick={handlePurchase}>Purchase</button>}
        {isPurchased && (
          <button onClick={handleCopyClick}>Copy to Clipboard</button>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;