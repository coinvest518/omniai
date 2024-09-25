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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, promptTitle, description, promptData, onPurchase, showCopyButton, creditPrice, isPurchased, promptId }) => {
    const { user } = useUser(); // Directly access the user
    const [localPromptData, setLocalPromptData] = useState(promptData);

    if (!isOpen || !user) return null; // Ensure modal doesn't open unless user is authenticated

    const handlePurchase = () => {
        if (user.id) {
            onPurchase(user.id, promptId); // Use Clerk's user ID directly
        } else {
            alert('User not authenticated');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{promptTitle}</h2>
                <p>Credit Price: {creditPrice}</p>
                <p>Description: {description}</p>
                <p>Prompt Data: {promptData}</p>
                {!isPurchased && (
                    <button onClick={handlePurchase}>Purchase</button>
                )}
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
