// components/SignInModal.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    };

    const closeButtonVariants = {
        hover: { scale: 1.1 },
        tap: { scale: 0.9 },
    };

    return (
        <div className="sign-in-modal">
            <div className="modal-overlay" onClick={onClose}></div>
            <motion.div
                className="modal-content"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
            >
                <h2>Welcome to Omni.Ai</h2>
                <p>Please sign in or sign up to access the app.</p>
                <div className="sign-in-buttons">
                    <Link href="https://accounts.omniai.icu/sign-in" className="button">
                        <i className="ph-lightning-bold"></i>
                        <span>Sign In</span>
                    </Link>
                    <Link href="https://accounts.omniai.icu/sign-up" className="button">
                        <i className="ph-bell-bold"></i>
                        <span>Sign Up</span>
                    </Link>
                </div>
                <motion.button
                    className="close-button"
                    onClick={onClose}
                    variants={closeButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <FontAwesomeIcon icon={faTimes} />
                    </motion.button>
            </motion.div>
        </div>
    );
};

export default SignInModal;