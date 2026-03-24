import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/firebase';
import { User, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(userProfile?.displayName || user.displayName || '');
      setPhotoURL(userProfile?.photoURL || user.photoURL || '');
    }
  }, [user, userProfile]);

  const resizeImage = (base64Str: string, maxWidth = 256, maxHeight = 256): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG with 0.7 quality
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Resize/Compress
        const resizedImage = await resizeImage(base64String);
        setPhotoURL(resizedImage);
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to read file' });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setMessage({ type: 'error', text: 'Failed to process image' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      await updateUserProfile(user, displayName, photoURL);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-swiss-black pb-4 gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">PROFILE.</h1>
        <span className="swiss-label">User / Settings</span>
      </div>

      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        <div className="col-span-12 lg:col-span-4">
          <div className="border border-swiss-black p-6 md:p-12 bg-swiss-white space-y-8">
            <h2 className="text-2xl font-black tracking-tighter uppercase">Identity.</h2>
            <div className="relative group max-w-[280px] mx-auto lg:max-w-none">
              <div className="aspect-square border border-swiss-black overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-swiss-black">
                    <User className="w-24 h-24" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 swiss-button p-3 md:p-4 shadow-xl"
                title="Upload Photo"
              >
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <p className="swiss-label text-gray-400 pt-8 text-center lg:text-left">
              Update your visual representation within the community. Grayscale by default, true colors on interaction.
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="border border-swiss-black p-6 md:p-12 bg-swiss-white space-y-8 md:space-y-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Edit Details.</h2>

            {message && (
              <div className={`p-4 md:p-6 border flex items-center gap-4 font-black uppercase tracking-tighter text-sm md:text-base ${
                message.type === 'success' ? 'bg-swiss-white border-swiss-black text-swiss-black' : 'bg-swiss-red border-swiss-red text-white'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-4">
                <label htmlFor="displayName" className="swiss-label">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-0 py-4 md:py-6 border-b border-swiss-black focus:border-swiss-red outline-none transition-all font-black uppercase tracking-tighter text-xl sm:text-2xl md:text-4xl placeholder:text-gray-200"
                  placeholder="ENTER NAME..."
                  required
                />
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="swiss-button w-full py-4 sm:py-6 md:py-8 flex items-center justify-center gap-4"
                >
                  {loading ? (
                    <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">Save Changes.</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
