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
  showCopyButton: boolean;
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
  const isUserPrompt = user?.id === userId;
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setLocalPromptData(promptData);
  }, [promptData]);

  const handleCopyClick = () => {
    if (localPromptData) {
      copyToClipboard(localPromptData, 'Prompt Data Copied to Clipboard!');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [isCopied]);
  const handlePurchase = () => {
    onPurchase(userId, promptId); // Use Clerk's user ID directly
  };
  return (
    isOpen && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{promptTitle}</h2>
        <p>Credit Price: {creditPrice}</p>
        <p>Description: {description}</p>
        <p>Prompt Data: {promptData}</p>
        {(showCopyButton || isUserPrompt || isPurchased) && (
            <div>
              <button onClick={handleCopyClick}>
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
          {!isPurchased && !isUserPrompt && (
            <button onClick={handlePurchase}>Purchase</button>
          )}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    )
  );
};

export default Modal;
