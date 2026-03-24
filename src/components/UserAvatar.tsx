import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface UserAvatarProps {
  userId: string;
  fallbackPhoto?: string;
  fallbackName?: string;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ userId, fallbackPhoto, fallbackName, className }) => {
  const [photoURL, setPhotoURL] = useState<string | null>(fallbackPhoto || null);
  const [displayName, setDisplayName] = useState<string | null>(fallbackName || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhotoURL(data.photoURL || null);
        setDisplayName(data.displayName || null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user avatar:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (photoURL) {
    return (
      <div className={className}>
        <img 
          src={photoURL} 
          alt={displayName || 'User'} 
          className="h-full w-full object-cover" 
          referrerPolicy="no-referrer" 
          onError={(e) => {
            // If the photo fails to load, try ui-avatars as a backup
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random`;
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center font-black text-swiss-black bg-gray-100`}>
      {displayName?.charAt(0) || fallbackName?.charAt(0) || '?'}
    </div>
  );
};

export default UserAvatar;
