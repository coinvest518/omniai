import React, { useState } from 'react';

import './Modal.css'; 
import { copyToClipboard } from '~/common/util/clipboardUtils'; // Import the utility function
// Create a CSS file for modal styles

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    promptTitle: string;
    creditPrice: number;
    description: string;
    promptData: string;
    onPurchase: () => void; // Add onPurchase prop
    showCopyButton: boolean;
    isPurchased?: boolean; 
  }
  
  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, promptTitle, description, promptData, onPurchase, showCopyButton, creditPrice, isPurchased }) => {
    const [localPromptData, setLocalPromptData] = useState(promptData); // Local state for prompt data
  
    if (!isOpen) return null;
  
    const handleCopy = () => {
        copyToClipboard(promptData, promptTitle); 
      alert(`${promptTitle} prompt data copied to clipboard!`); // Feedback to the user
    };
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalPromptData(e.target.value); // Update local state
         // Call the parent function to update prompt data
      };
      return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{promptTitle}</h2>  {/* Add this line to display the title */}
                <p>Credit Price: {creditPrice}</p>
                <p>Description: {description}</p>
                <p>Prompt Data: {promptData}</p>
                {!isPurchased && <button onClick={onPurchase}>Purchase</button>}
                {showCopyButton && (
                    <button onClick={() => navigator.clipboard.writeText(promptData)}>
                        Copy Prompt
                    </button>
                )}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};
  
  export default Modal;