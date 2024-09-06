/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { AccountCircle } from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';

const UserIcon: React.FC = () => {
  const { user } = useUser();
  const profileImageUrl = user?.imageUrl;  // Ensure this is the correct property

  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt="User Icon"
        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
      />
    );
  }
  return <AccountCircle />;
};

export default UserIcon;
