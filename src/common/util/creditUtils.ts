import { useUserStore } from '~/common/state/userStore';


export function useDeductCredits() {
  const { user, updateCredits } = useUserStore((state) => ({
    user: state.user,
    updateCredits: state.updateCredits,
  }));

  const deductCredits = async (cost: number): Promise<boolean> => {
    if (!user) {
      alert('User not found');
      return false;
    }

    if (user.credits >= cost) {
      updateCredits(user.credits - cost);

      const response = await fetch('/api/updateUserdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: user.credits - cost,
        }),
      });

      if (response.ok) {
        return true; // Credits deducted successfully
      } else {
        console.error('Failed to update user credits');
        return false; // Failed to deduct credits
      }
    } else {
      alert('Insufficient credits to access this feature.');
      return false; // Not enough credits
    }
  };

  return { deductCredits };
}