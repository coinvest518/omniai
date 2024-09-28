import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import styled from 'styled-components';
import { useUser, useAuth } from '@clerk/nextjs'; // Import useAuth
import { addSnackbar } from '~/common/components/useSnackbarsStore';


const ModalContainer = styled(motion.div)`
  background-color: #f5f5f5; 
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 20px;
  font-family: 'Inter, sans-serif';
  max-width: 90vw;
  width: 300px;
`;


const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;

  &:hover {
    color: #555;
  }
`;

const RewardButton = styled.button`
  background-color: #4CAF50; 
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
  }
`;

const DailyRewardButton = styled.button`
  position: fixed;
  top: 5rem;
  right: 9rem;
  z-index: 1000;
  background-color: #4393E4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #185EA5;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
`;


export default function DailyRewards({}): JSX.Element {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth(); // Call useAuth here



  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !user?.id) return; // If not logged in, don't fetch data

      try {
        const response = await fetch(`/api/user-data?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setStreak(data.dailyStreak || 0);
          setLastClaimDate(data.lastClaimDate ? new Date(data.lastClaimDate) : null);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (error) {
        setError('An error occurred while fetching user data');
      }
    };

    fetchUserData();
  }, [isSignedIn, user?.id]); // Fetch user data when user ID changes (login/logout)

  useEffect(() => {
    const currentDate = new Date();
    if (lastClaimDate && !isNewDay(lastClaimDate, currentDate)) {
      setIsOpen(true);
    }
  }, [lastClaimDate]);

  const isNewDay = (lastDate: Date, currentDate: Date) => {
    return lastDate.getDate() !== currentDate.getDate() || 
           lastDate.getMonth() !== currentDate.getMonth() || 
           lastDate.getFullYear() !== currentDate.getFullYear();
  };

  const claimReward = async () => {
    if (!isSignedIn) {
      addSnackbar({
        key: 'daily-reward-signin',
        message: 'You need to be logged in to claim rewards!',
        type: 'issue',
        overrides: {
          autoHideDuration: 5000,
        },
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dailyRewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }), // Add userId to body

      });

      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak);
        setReward(data.reward);
        setLastClaimDate(new Date());
        setIsOpen(false); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to claim reward');
      }
    } catch (error) {
      setError('An error occurred while claiming the reward');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DailyRewardButton onClick={() => setIsOpen(true)}> {/* Button always shows */}
        Daily Reward
      </DailyRewardButton>

      <AnimatePresence>
        {isOpen && (
          <ModalContainer
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-16 right-4 z-[1001]"
          >
            <div>
              <div className="relative">
                <h2>Daily Reward</h2>
                <CloseButton onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </CloseButton>
                <div className="text-center">
                  {error && <p className="text-red-500">{error}</p>}
                  <div className="mb-3">
                    <Gift className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                    <p className="text-base font-semibold text-gray-700">Your Reward:</p>
                    <p className="text-2xl font-bold text-yellow-500">{reward} Credits</p>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">Current Streak: {streak} days</p>
                  <RewardButton onClick={claimReward} disabled={isLoading || !isSignedIn}> 
                    {isLoading ? 'Claiming...' : 'Claim Reward'}
                  </RewardButton>
                </div>
              </div>
            </div>
          </ModalContainer>
        )}
      </AnimatePresence>
    </>
  );
}


