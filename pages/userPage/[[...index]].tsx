import './Component.css'; // Your CSS file (make sure to create it)
import GlassmorphismCard from '../prompts/GlassmorphismCard'; // Import the component
import Modal from '../prompts/GlassModal'; // Import Font Awesome
import { prompts, Prompt } from '../../data/promptsData'; // Import prompts from the new file
import { useUserStore } from '~/common/state/userStore';
import React, { useEffect, useState, useCallback } from 'react';
import { SignInButton, SignOutButton, useAuth, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';
import { creditDetails } from '../../lib/creditDetails';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import SignInModal from './SignInModal';
import UserIcon from '../../src/common/components/UserIcon';






const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);




interface UserData {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    planName: string;
    credits: number;
    tokens: number;
    stripeSubscriptionId: string | null;
    purchasedPromptIds: Prompt["id"][]; // Add this line
    isPurchased?: boolean;
    promptTitle?: string;
    creditPrice?: number;
    imgSrc?: string;
    category?: string;
    promptData?: string;
}




const AppUsers: React.FC = () => {
    const { user } = useUser();
    const { isSignedIn, userId } = useAuth();
    const setUser = useUserStore(state => state.setUser);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshUserData, setRefreshUserData] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCopyButton, setShowCopyButton] = useState(false); // State 
    const [prevCredits, setPrevCredits] = useState<number | null>(null);
    const [prevTokens, setPrevTokens] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState<string | null>(null);
    const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);




    const handleCardClick = (prompt: Prompt) => {
        console.log('Selected Prompt:', prompt); // Log selected prompt

        setSelectedPrompt(prompt);
        setIsModalOpen(true);
        setShowCopyButton(false); // Hide copy button initially
    };



    const handleCreditPurchase = async (priceId: string) => {
        try {
            const response = await fetch('/api/creditBuy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const { sessionId } = await response.json();
            const stripe = await stripePromise;

            // Redirect to Stripe for payment confirmation
            if (stripe) {
                const result = await stripe.redirectToCheckout({ sessionId });
                if (result.error) {
                    console.error('Failed to redirect to checkout:', result.error.message);
                } else {
                    // Fetch the latest user data after successful payment
                    const userDataResponse = await fetch(`/api/user-data?userId=${userId}`);
                    if (!userDataResponse.ok) {
                        throw new Error('Failed to fetch updated user data');
                    }
                    const updatedUserData = await userDataResponse.json();

                    // Update local user data
                    setUserData(updatedUserData);
                    setUser(updatedUserData);

                    // Update previous values
                    setPrevCredits(updatedUserData.credits);
                    setPrevTokens(updatedUserData.tokens);
                }
            } else {
                console.error('Stripe has not been initialized');
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
        }
    };

    const handlePurchase = async () => {
        if (!selectedPrompt || !userData) {
            alert('Please select a prompt and ensure you are signed in.');
            return;
        };

        const { creditPrice, promptTitle, imgSrc, category, promptData, id: promptId } = selectedPrompt;
        const { id, credits } = userData;

        // Check if the user has enough credits
        if (credits < creditPrice) {
            alert('Not enough credits to purchase this prompt.');
            return;
        }

        try {
            const response = await fetch('/api/promptsBuy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: id,
                    promptId: promptId?.toString() || 'No Prompts', // Convert ObjectId to string
                    promptTitle,
                    creditPrice,
                    imgSrc,
                    category,
                    promptData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete purchase');
            }

            // Fetch the latest user data
            const userDataResponse = await fetch(`/api/user-data?userId=${userId}`);
            if (!userDataResponse.ok) {
                const errorData = await userDataResponse.json();
                if (errorData.message === 'User not found') {
                    alert('User not found. Please sign in again.');
                }
                throw new Error(errorData.message || 'Failed to fetch updated user data');
            }
            // Update local user data
            setUserData((prevData) => ({
                ...prevData,
                purchasedPromptIds: [...(prevData?.purchasedPromptIds || []), promptId],
                id: prevData?.id || '',
                email: prevData?.email || '',
                firstName: prevData?.firstName || null,
                lastName: prevData?.lastName || null,
                planName: prevData?.planName || '',
                credits: prevData?.credits || 0,
                tokens: prevData?.tokens || 0,
                stripeSubscriptionId: prevData?.stripeSubscriptionId || null,
                isPurchased: true,
            }));

            setShowCopyButton(true);
            alert('Purchase successful!');
        } catch (error) {
            console.error('Error during purchase:', error);
            alert(`Purchase failed: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        }
    };

    // Fetch user data on sign-in
    const handleSignIn = useCallback(async () => {
        if (isSignedIn && userId) {
            setIsLoading(true);
            try {
                const userDataResponse = await fetch(`/api/user-data?userId=${userId}`);
                if (!userDataResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await userDataResponse.json();
                setUserData(userData);
                setUser(userData);


                // Store current values as previous values
                setPrevCredits(userData.credits);
                setPrevTokens(userData.tokens);


            } catch (error) {
                console.error('Error handling sign in:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isSignedIn, userId, setUser]);

    useEffect(() => {
        if (isSignedIn && userId) {
            handleSignIn();
        }
    }, [isSignedIn, userId, handleSignIn, refreshUserData]);

    const fetchUserPrompts = async (userId: string) => {
        try {
            const response = await fetch(`/api/user-prompts?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user prompts');
            }
            const data = await response.json();
            console.log('Fetched User Prompts:', data); // Log fetched data
            return data;
        } catch (error) {
            console.error('Error fetching user prompts:', error);
            return [];
        }
    };


    useEffect(() => {
        if (userData) {
            fetchUserPrompts(userData.id).then(data => {
                console.log('Setting User Prompts:', data); // Log state update
                setUserPrompts(data);
            });
        }
    }, [userData]);

    // Handle checkout success
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('checkout') === 'success') {
            setRefreshUserData(prev => !prev);
        }
    }, []);



    const calculatePercentageChange = (current: number, previous: number | null) => {
        if (previous === null || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };



    const filteredPrompts = activeTab === 'user-prompts'
        ? userPrompts
        : prompts.filter(prompt => {
            if (activeTab === 'all') return true;
            return prompt.category === activeTab;
        });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isSignedIn) {
                setShowSignInModal(true);
            }
        }, 5000); // 5000 milliseconds = 5 seconds

        return () => clearTimeout(timer);
    }, [isSignedIn]);

    const closeSignInModal = () => {
        setShowSignInModal(false);
    };
    const toggleMenuModal = () => {
        setShowSignInModal(true);
    };

    const handleFreeCredits = async () => {
        try {
            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to create user and assign credits');
            }

            const updatedUserData = await response.json();
            setUserData(updatedUserData);
            setUser(updatedUserData);
            alert('You have received 10 free credits!');
        } catch (error) {
            console.error('Error assigning free credits:', error);
            alert(`Failed to assign free credits: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        }
    };


    return (
        <div>
            <header className="header">
                <div className="header-content responsive-wrapper">
                    <div className="header-logo">
                        <Link href="./">
                            <div>
                                <Image src="/images/icon-32x32.png" width={82} height={82} alt="Logo" />
                            </div>
                        </Link>
                    </div>
                    <div className="header-navigation">
                        <nav className="header-navigation-as">
                            <Link href="./" style={{ textDecoration: 'none' }}> Home </Link>
                            <Link href="https://accounts.omniai.icu/sign-in" style={{ textDecoration: 'none' }}> Sign In </Link>

                            <Link href="/" style={{ textDecoration: 'none' }}> Omni.AI </Link>
                            <Link href="/price/PricingPage" style={{ textDecoration: 'none' }}> Plans </Link>
                            <div className="dropdown">
                                <div className="credits-label">Credits</div>
                                <div className="dropdown-content">
                                    {creditDetails.map((credit) => (
                                        <button
                                            key={credit.priceId}
                                            onClick={() => handleCreditPurchase(credit.priceId)}
                                        >
                                            {credit.credits} Credits
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </nav>
                    </div>
                    <div className="icon-button" style={{ position: 'relative', zIndex: 10001 }}>
                        <UserButton />
                    </div>

                    <div className="menu-button">
                        <i className="ph-list-bold"></i>
                        <span>Menu</span>
                        <ul className="dropdown-menu">
                            <li><Link href="./">Home</Link></li>
                            <li><Link href="/">Omni.AI</Link></li>
                            <li><Link href="/price/PricingPage">Plans</Link></li>
                            <li className="dropdown">
                                <span>Credits</span>
                                <ul className="dropdown-content">
                                    {creditDetails.map((credit) => (
                                        <li key={credit.priceId}>
                                            <button onClick={() => handleCreditPurchase(credit.priceId)}>
                                                {credit.credits} Credits
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
            <main className="main">
                <div className="responsive-wrapper">
                    <div className="main-header">
                        <h1>Omni.Ai</h1>

                    </div>

                    <div className="horizontal-tabs">
                        <div className="horizontal-tab-item">
                            <Link href="#" onClick={handleFreeCredits} style={{ textDecoration: 'none' }}>10 Free Credits</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="/" style={{ textDecoration: 'none' }}>Omni Chat</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="/personas" style={{ textDecoration: 'none' }}>Omni YouTube</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="/chat" style={{ textDecoration: 'none' }}>Omni Art</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="/" style={{ textDecoration: 'none' }}>Omni Beam</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="https://discord.gg/NTNszcwE" style={{ textDecoration: 'none' }}>Bug Bounty</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="https://discord.gg/NTNszcwE" style={{ textDecoration: 'none' }}>White Label</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="https://discord.gg/NTNszcwE" style={{ textDecoration: 'none' }}>Feedback</Link>
                        </div>
                        <div className="horizontal-tab-item">
                            <Link href="#" onClick={() => handleTabChange('user-prompts')} style={{ textDecoration: 'none' }}>User Prompts</Link>
                        </div>
                    </div>
                    <div className="content-header">
                        <div className="content-header-intro">
                            <h2>Youn Plan and Usage</h2>
                        </div>
                        {user && (
                            <p>Welcome, {user.firstName || user.username}</p>
                        )}
                        <div className="content-header-actions">
                            <Link href="#" className="button">
                                <i className="ph-faders-bold"></i>
                                <span>Filters</span>
                            </Link>
                            <div className="button">
                                <i className="ph-plus-bold"></i>
                                <Link style={{ textDecoration: 'none' }} href="https://gleam.io/1Pm9S/omni-credits-giveaway" rel="nofollow">
                                    <p>Omni Credits Giveaway</p>
                                </Link>
                                <script type="text/javascript" src="https://widget.gleamjs.io/e.js" async></script>
                            </div>
                        </div>
                    </div>
                    <div className="content-header-cards-container">
                        <div className="content-header-cards bg-blue-500 p-4 rounded-lg shadow-lg">
                            <div className="flex-auto">
                                <div className="flex -mx-3">
                                    <div className="flex-none w-2/3 max-w-full px-3">
                                        <div>
                                            <p className="mb-0 font-sans font-semibold leading-normal uppercase text-sm text-white">Your Plan </p>
                                            <h5 className="mb-2 font-bold text-white">{userData?.planName || 'No Active Plan'}</h5>
                                            <p className="mb-0 text-white opacity-80">
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="content-header-cards bg-blue-500 p-4 rounded-lg shadow-lg">
                            <div className="flex-auto">
                                <div className="flex -mx-3">
                                    <div className="flex-none w-2/3 max-w-full px-3">
                                        <div>
                                            <p className="mb-0 font-sans font-semibold leading-normal uppercase text-sm text-white">Your Credits</p>
                                            <h5 className="mb-2 font-bold text-white">{userData?.credits || 0}</h5>
                                            <p className="mb-0 text-white opacity-80">
                                                {prevCredits !== null && (
                                                    <span className={`font-bold leading-normal text-sm ${calculatePercentageChange(userData?.credits || 0, prevCredits) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                                        {calculatePercentageChange(userData?.credits || 0, prevCredits).toFixed(2)}%
                                                    </span>
                                                )} Credits Usage
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="content-header-cards bg-blue-500 p-4 rounded-lg shadow-lg">
                            <div className="flex-auto">
                                <div className="flex -mx-3">
                                    <div className="flex-none w-2/3 max-w-full px-3">
                                        <div>
                                            <p className="mb-0 font-sans font-semibold leading-normal uppercase text-sm text-white">User Tokens</p>
                                            <h5 className="mb-2 font-bold text-white">{userData?.tokens}</h5>
                                            <p className="mb-0 text-white opacity-80">
                                                {prevTokens !== null && (
                                                    <span className={`font-bold leading-normal text-sm ${calculatePercentageChange(userData?.tokens || 0, prevTokens) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                                        {calculatePercentageChange(userData?.tokens || 0, prevTokens).toFixed(2)}%
                                                    </span>
                                                )} Token Usage
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    { /* Promptssection */}
                    <div className="content">
                        <div className="content-panel">
                            <div className="vertical-tabs">
                                <div className={activeTab === 'all' ? 'active' : ''} onClick={() => handleTabChange('all')}>All Prompts</div>
                                <div className={activeTab === 'developer' ? 'active' : ''} onClick={() => handleTabChange('developer')}>Developer Prompts</div>
                                <div className={activeTab === 'youtube' ? 'active' : ''} onClick={() => handleTabChange('youtube')}>YouTube Prompts</div>
                                <div className={activeTab === 'business' ? 'active' : ''} onClick={() => handleTabChange('business')}>Business Prompts</div>
                                <div className={activeTab === 'social' ? 'active' : ''} onClick={() => handleTabChange('social')}>Social Media Prompts</div>
                                <div className={activeTab === 'art' ? 'active' : ''} onClick={() => handleTabChange('art')}>Generative Art</div>
                                <div className={activeTab === 'UserPrompts' ? 'active' : ''} onClick={() => handleTabChange('user-prompts')}>User Prompts</div>
                                <div><Link href="https://coinvestinc.medium.com/" style={{ textDecoration: 'none' }}>Blog</Link></div>
                                <div className={activeTab === 'dao' ? 'active' : ''} onClick={() => handleTabChange('dao')}>OMNI NFT (Coming Soon)</div>
                            </div>
                        </div>


                        <div className="card-grid">

                            {activeTab === 'user-prompts' && userPrompts.length > 0 ? (
                                userPrompts.map((prompt: Prompt, index: any) => (
                                    <GlassmorphismCard
                                        key={index}
                                        imgSrc={prompt.imgSrc}
                                        promptTitle={prompt.promptTitle || prompt.promptTitle}
                                        description={prompt.description}
                                        onClick={() => handleCardClick(prompt)}
                                        prompts={userPrompts}

                                        isPurchased={userData?.purchasedPromptIds?.includes(prompt.id) || false}
                                    />
                                ))
                            ) : (
                                filteredPrompts.length > 0 ? (
                                    filteredPrompts.map((prompt, index) => (
                                        <GlassmorphismCard
                                            key={index}
                                            imgSrc={prompt.imgSrc}
                                            prompts={filteredPrompts}
                                            promptTitle={prompt.promptTitle || prompt.promptTitle} // Ensure this is correct
                                            description={prompt.description}
                                            onClick={() => handleCardClick(prompt)}
                                            isPurchased={userData?.purchasedPromptIds?.includes(prompt.id) || false}
                                        />
                                    ))
                                ) : (
                                    <p>No prompts available for this user.</p>
                                )
                            )}
                            {selectedPrompt && (
                                <Modal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    promptTitle={selectedPrompt.promptTitle || selectedPrompt.promptTitle}
                                    creditPrice={selectedPrompt.creditPrice}
                                    description={selectedPrompt.description}
                                    promptData={selectedPrompt.promptData}
                                    onPurchase={handlePurchase}
                                    showCopyButton={showCopyButton}
                                    isPurchased={userData?.purchasedPromptIds?.includes(selectedPrompt.id) || false}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <SignInModal isOpen={showSignInModal} onClose={closeSignInModal} />
        </div>

    );
};



export default AppUsers;


