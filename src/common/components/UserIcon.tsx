/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { AccountCircle } from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

const UserIcon: React.FC = () => {
  const { user } = useUser();
  const profileImageUrl = user?.imageUrl;  // Ensure this is the correct property

  if (profileImageUrl) {
    return (
      <Image
      src={profileImageUrl}
      alt="User Icon"
      width={44} // Specify width here
      height={44} // Specify height here
      style={{ borderRadius: '50%' }}
    />
    );
  }
  return <AccountCircle />;
};

export default UserIcon;
