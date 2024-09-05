import React from 'react';
import { AccountCircle } from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';

const UserIcon: React.FC = () => {
  const { user } = useUser();
  const profileImageUrl = user?.imageUrl;  // Adjust this property as needed based on Clerk's documentation

  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt="User Icon"
        width={24}
        height={24}
        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
      />
    );
  }
  return <AccountCircle />;
};

export default UserIcon;
