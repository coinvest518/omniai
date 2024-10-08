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
import SignInModal from './SignInModal';
import styles from './AppUsers.module.css';

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
  purchasedPromptIds: Prompt["id"][];
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
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [prevCredits, setPrevCredits] = useState<number | null>(null);
  const [prevTokens, setPrevTokens] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const fetchUserPrompts = useCallback(async (userId: string) => {
    if (!userId) return []; // Early return if no userId
  
    try {
      const response = await fetch(`/api/user-prompts?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user prompts');
      }
      const data = await response.json();
  
      setUserPrompts(prevPrompts => {
        const newPrompts = data.userPrompts.map((prompt: { id: string | undefined; }) => ({
          ...prompt,
          isPurchased: userData?.purchasedPromptIds?.includes(prompt.id) || false
        }));
        // Avoid re-setting state if prompts have not changed
        if (JSON.stringify(prevPrompts) !== JSON.stringify(newPrompts)) {
          return newPrompts;
        }
        return prevPrompts;
      });
  
      return data.userPrompts || [];
    } catch (error) {
      console.error('Error fetching user prompts:', error);
      return [];
    }
  }, [userData?.purchasedPromptIds]);

  const fetchUserData = useCallback(async () => {
    if (!isSignedIn || !userId) {
      console.error('User is not signed in or userId is missing.');
      return;
    }
    


      setIsLoading(true);
      try {
        const userDataResponse = await fetch(`/api/user-data?userId=${userId}`);
        if (!userDataResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userDataResponse.json();
        setUserData(userData);
        setUser(userData);

        setPrevCredits(userData.credits);
        setPrevTokens(userData.tokens);

        if (!userPrompts.length) {
          const fetchedUserPrompts = await fetchUserPrompts(userId);
          setUserPrompts(fetchedUserPrompts);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    
  }, [isSignedIn, userId, setUser]);

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchUserData();
    }
  }, [fetchUserData, isSignedIn, userId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const signinSuccess = urlParams.get('signin') === 'success';
    setShowSignInModal(!isSignedIn && !signinSuccess);
  }, [isSignedIn]);

  const closeSignInModal = () => {
    setShowSignInModal(false);
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'success') {
      setRefreshUserData((prev) => !prev);
    }
  }, []);

  const handleCardClick = (prompt: Prompt, _userId: string) => {
    console.log('Selected Prompt:', prompt);
    setSelectedPrompt(() => ({
      ...prompt,
      isPurchased: userData?.purchasedPromptIds?.includes(prompt.id) || false,
      showCopyButton: activeTab === 'user-prompts' || userData?.purchasedPromptIds?.includes(prompt.id) || prompt.userId === userData?.id,
    }));
    setIsModalOpen(true);
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

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const result = await stripe.redirectToCheckout({ sessionId });
        if (result.error) {
          console.error('Failed to redirect to checkout:', result.error.message);
        } else {
          if (userData) {
            fetchUserData();
          } else {
            throw new Error('User data is not available');
          }
        }
      } else {
        console.error('Stripe has not been initialized');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const calculatePercentageChange = (current: number, previous: number | null) => {
    if (previous === null || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const filteredPrompts =
    activeTab === 'user-prompts'
      ? userPrompts
      : prompts.filter((prompt) => {
        if (activeTab === 'all') return true;
        return prompt.category === activeTab;
      });

  const toggleMenuModal = () => {
    setShowSignInModal(true);
  };

  const handleFreeCredits = async () => {
    try {
      const response = await fetch('/api/assign-free-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userData?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign free credits');
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

 const handlePurchase = async (promptId: string) => {
  try {
    const response = await fetch('/api/promptsBuy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData?.id,
        promptId,
        promptTitle: selectedPrompt?.promptTitle,
        promptData: selectedPrompt?.promptData,
        imgSrc: selectedPrompt?.imgSrc,
        creditPrice: selectedPrompt?.creditPrice,
        category: selectedPrompt?.category,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Prompt Purchase successful');
      setSelectedPrompt((prevPrompt) => ({
        ...prevPrompt,
        isPurchased: true,
      }) as Prompt);

       // Update userPrompts with the purchased status
       setUserPrompts(prevPrompts => 
        prevPrompts.map(p => 
          p.id === promptId ? { ...p, isPurchased: true } : p
        )
      );

    console.log("Purchase successful - Setting showCopyButton to true");
    setShowCopyButton(true); 
    console.log("showCopyButton state:", showCopyButton); // Check if it's actually true
    setIsModalOpen(false); 

      // Refresh user data
      await fetchUserData();
      
      // Refresh user prompts
      if (userData?.id) {
        await fetchUserPrompts(userData.id);
      }
    } else {
      throw new Error(result.message || 'Purchase failed');
    }
  } catch (error) {
    console.error('Error purchasing prompt:', error);
    alert('You dont have enough credits');
  }
};
useEffect(() => {
  console.log("selectedPrompt changed:", selectedPrompt);
  console.log("isPurchased:", selectedPrompt?.isPurchased);
  if (selectedPrompt?.isPurchased) {
    console.log("Setting showCopyButton to true inside useEffect");
    setShowCopyButton(true);
  }
}, [selectedPrompt]); 


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
              <Link href="/" style={{ textDecoration: 'none' }}> Home </Link>
              <Link href="/chat" style={{ textDecoration: 'none' }}> Launch App </Link>

              <Link href="https://accounts.omniai.icu/sign-in" style={{ textDecoration: 'none' }}> Sign Up </Link>
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
          <div className={styles.userButtonWrapper}>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className={styles.signInButton}>Sign In</button>
              </SignInButton>
            </SignedOut>
          </div>

          <div className="menu-button">
            <i className="ph-list-bold"></i>
            <span>Menu</span>
            <ul className="dropdown-menu">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/chat">Omni.AI</Link></li>
              <li>
                <Link href="https://accounts.omniai.icu/sign-in">Sign Up</Link>
              </li>
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
              <Link href="#" onClick={handleFreeCredits} style={{ textDecoration: 'none' }}>100 Free Credits</Link>
            </div>
            <div className="horizontal-tab-item">
              <Link href="/chat" style={{ textDecoration: 'none' }}>Omni Chat</Link>
            </div>
            <div className="horizontal-tab-item">
              <Link href="/personas" style={{ textDecoration: 'none' }}>Omni Transcriber</Link>
            </div>
            <div className="horizontal-tab-item">
              <Link href="/chat" style={{ textDecoration: 'none' }}>Omni Art</Link>
            </div>
            <div className="horizontal-tab-item">
              <Link href="/chat" style={{ textDecoration: 'none' }}>Omni Beam</Link>
            </div>
            <div className="horizontal-tab-item">
              <Link href="https://streets2entretrepreneurs.myshopify.com/" style={{ textDecoration: 'none' }}>Omni Alien Merch</Link>
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
                  <p>Omni 1000 Credits Giveaway</p>
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
                userPrompts.map((prompt: Prompt) => (
                  <GlassmorphismCard
                    key={prompt.id}
                    imgSrc={prompt.imgSrc}
                    promptTitle={prompt.promptTitle}
                    description={prompt.description}
                    onClick={() => handleCardClick(prompt, userData?.id || '')}
                    prompts={userPrompts}
                    isPurchased={userData?.purchasedPromptIds?.includes(prompt.id) || false}
                    showCopyButton={true} // Always show copy button for user prompts

                  />
                ))
              ) : (
                filteredPrompts.length > 0 ? (
                  filteredPrompts.map((prompt: Prompt) => (
                    <GlassmorphismCard
                      key={prompt.id}
                      imgSrc={prompt.imgSrc}
                      prompts={filteredPrompts}
                      promptTitle={prompt.promptTitle} // Ensure this is correct
                      description={prompt.description}
                      onClick={() => handleCardClick(prompt, userData?.id || '')}
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
                  onPurchase={() => handlePurchase(selectedPrompt.id || '')}
                  showCopyButton={selectedPrompt.showCopyButton || false}
                  promptId={selectedPrompt.id ?? ''}
                  userId={userData?.id || ''}
                  isPurchased={selectedPrompt?.isPurchased || false}
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


