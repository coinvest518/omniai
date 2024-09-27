import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import './Modal.css';
import { copyToClipboard } from '~/common/util/clipboardUtils';
import { Prompt } from '../../data/promptsData';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptTitle: string;
  creditPrice: number;
  description: string;
  promptData?: string;
  onPurchase: (userId: string, promptId: string) => void;
  showCopyButton?: boolean;
  isPurchased: boolean;
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
                                      showCopyButton,
                                      userId,
                                    }) => {
  const { user } = useUser(); // Directly access the user
  const [localPromptData, setLocalPromptData] = useState(promptData);

  useEffect(() => {
    setLocalPromptData(promptData);
  }, [promptData]);

  const handleCopyClick = () => {
    if (localPromptData) { // Only copy if localPromptData exists
      copyToClipboard(localPromptData, 'Prompt Data Copied to Clipboard!');
    }
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
        <p>Prompt Data: {promptData}</p> 
        {isPurchased && showCopyButton ? (
          <button onClick={handleCopyClick}>Copy to Clipboard</button>
        ) : (
          <button onClick={handlePurchase}>Purchase</button>

        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
