import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPosts, addPost, deletePost, updatePost, addComment, getComments, toggleLike, checkIfLiked, db } from '../services/firebase';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Send, MessageCircle, Trash2, Image as ImageIcon, X, CornerDownRight, Pencil, AlertCircle, Maximize2 } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  commentCount?: number;
}

const Community = () => {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fullSizeImageUrl, setFullSizeImageUrl] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [loadingComments, setLoadingComments] = useState<{[key: string]: boolean}>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{[key: string]: boolean}>({});
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(() => {
    const saved = localStorage.getItem('hideCommunityGuidelines');
    return saved !== 'true';
  });

  const handleCloseGuidelines = () => {
    setShowGuidelines(false);
    localStorage.setItem('hideCommunityGuidelines', 'true');
  };

  useEffect(() => {
    // Real-time listener for posts
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check liked status when posts or user changes
  useEffect(() => {
    if (!user || posts.length === 0) return;

    const checkLikes = async () => {
      const newLiked = new Set(likedPosts);
      let changed = false;
      
      for (const post of posts) {
        // Only check if we haven't checked this post yet (or to be safe, check all)
        // For simplicity and to avoid infinite loops if we depend on likedPosts, 
        // we'll just check all visible posts once when posts array changes significantly.
        // However, checking 20 docs is cheap.
        try {
          const isLiked = await checkIfLiked(post.id, user.uid);
          if (isLiked && !newLiked.has(post.id)) {
            newLiked.add(post.id);
            changed = true;
          } else if (!isLiked && newLiked.has(post.id)) {
            newLiked.delete(post.id);
            changed = true;
          }
        } catch (e) {
          console.error("Error checking like:", e);
        }
      }
      
      if (changed) setLikedPosts(newLiked);
    };

    checkLikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length, user?.uid]); // Only run when posts count changes or user changes to avoid loop

  const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit before resizing
        alert("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const resized = await resizeImage(base64);
        setPreviewUrl(resized);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deletePost(postToDelete);
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await updatePost(postId, editContent);
      setEditingPostId(null);
      setEditContent('');
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newPost.trim() && !imageFile)) return;

    setSubmitting(true);
    try {
      let imageUrl = '';
      if (previewUrl) {
        imageUrl = previewUrl; // Use base64 string directly since we don't have storage bucket guaranteed
      }

      await addPost(user.uid, userProfile?.displayName || user.displayName || 'Anonymous', userProfile?.photoURL || user.photoURL || '', newPost, imageUrl);
      setNewPost('');
      handleRemoveImage();
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    // Optimistic update
    const isLiked = likedPosts.has(postId);
    const newLiked = new Set(likedPosts);
    if (isLiked) newLiked.delete(postId);
    else newLiked.add(postId);
    setLikedPosts(newLiked);

    try {
      await toggleLike(postId, user.uid);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      if (isLiked) newLiked.add(postId);
      else newLiked.delete(postId);
      setLikedPosts(new Set(newLiked));
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);
    if (!comments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const postComments = await getComments(postId);
        setComments(prev => ({ ...prev, [postId]: postComments as Comment[] }));
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, postId: string, parentId?: string) => {
    e.preventDefault();
    const content = parentId ? replyContent[parentId] : newComment[postId];
    
    if (!user || !content?.trim()) return;

    try {
      await addComment(
        postId,
        user.uid,
        userProfile?.displayName || user.displayName || 'Anonymous',
        userProfile?.photoURL || user.photoURL || '',
        content,
        parentId
      );
      
      // Refresh comments
      const postComments = await getComments(postId);
      setComments(prev => ({ ...prev, [postId]: postComments as Comment[] }));
      
      if (parentId) {
        setReplyContent(prev => ({ ...prev, [parentId]: '' }));
        setReplyingTo(prev => ({ ...prev, [parentId]: false }));
      } else {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold uppercase tracking-widest text-xs">Loading community...</div>;

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-swiss-black pb-4 gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">COMMUNITY.</h1>
        <span className="swiss-label">Eco-Warriors / Feed</span>
      </div>

      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        {/* Sidebar: Guidelines & Post Form */}
        <div className="col-span-12 lg:col-span-4 space-y-8 lg:space-y-12">
          {/* Community Guidelines */}
          {showGuidelines && (
            <div className="border border-swiss-black p-6 md:p-8 relative bg-swiss-white">
              <button 
                onClick={handleCloseGuidelines}
                className="absolute top-4 right-4 text-swiss-black hover:text-swiss-red transition-colors"
                aria-label="Close guidelines"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black tracking-tighter mb-6 uppercase">Guidelines.</h2>
              <ul className="space-y-4 text-sm font-medium uppercase tracking-tight">
                <li className="flex items-start gap-3">
                  <span className="font-black text-swiss-red">01.</span> Be respectful and kind.
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-black text-swiss-red">02.</span> Share accurate information.
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-black text-swiss-red">03.</span> No spam or self-promotion.
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-black text-swiss-red">04.</span> Focus on sustainability.
                </li>
              </ul>
            </div>
          )}

          {/* New Post Form */}
          {user ? (
            <div className="border border-swiss-black p-6 md:p-8 bg-swiss-white">
              <h2 className="text-2xl font-black tracking-tighter mb-6 uppercase">New Post.</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="SHARE A TIP..."
                  className="w-full px-0 py-4 border-b border-swiss-black focus:border-swiss-red outline-none transition-all resize-none h-32 font-bold uppercase tracking-tighter text-lg md:text-xl placeholder:text-gray-300"
                />
                
                {previewUrl && (
                  <div className="relative border border-swiss-black p-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 bg-swiss-red text-white p-2 hover:bg-swiss-black transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4">
                  <label className="swiss-button bg-swiss-white text-swiss-black border border-swiss-black hover:bg-swiss-black hover:text-white cursor-pointer flex items-center justify-center gap-3">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    <ImageIcon className="w-5 h-5" />
                    <span className="swiss-label">Add Photo</span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || (!newPost.trim() && !imageFile)}
                    className="swiss-button flex items-center justify-center gap-3"
                  >
                    <Send className="w-4 h-4" /> 
                    <span className="swiss-label">Post</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border border-swiss-black p-8 text-center font-black uppercase tracking-tighter">
              Sign in to contribute.
            </div>
          )}
        </div>

        {/* Main Feed */}
        <div className="col-span-12 lg:col-span-8 space-y-12">
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-swiss-black bg-swiss-white overflow-hidden group"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-100 gap-4">
                  <div className="flex items-center gap-4 md:gap-6">
                    <UserAvatar 
                      userId={post.userId} 
                      fallbackPhoto={post.authorPhoto} 
                      fallbackName={post.authorName}
                      className="h-12 w-12 md:h-16 md:w-16 border border-swiss-black overflow-hidden transition-all shrink-0"
                    />
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase">{post.authorName}</h3>
                      <p className="swiss-label text-gray-400">{format(new Date(post.createdAt), 'PPP p')}</p>
                    </div>
                  </div>
                  {user?.uid === post.userId && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClick(post)}
                        className="p-2 md:p-3 border border-swiss-black hover:bg-swiss-black hover:text-white transition-colors shrink-0"
                        title="Edit post"
                      >
                        <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button 
                        onClick={() => setPostToDelete(post.id)}
                        className="p-2 md:p-3 border border-swiss-black hover:bg-swiss-red hover:text-white transition-colors shrink-0"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingPostId === post.id ? (
                  <div className="space-y-6 mb-8">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-0 py-4 border-b border-swiss-black focus:border-swiss-red outline-none transition-all resize-none h-32 font-bold uppercase tracking-tighter text-lg md:text-xl"
                      autoFocus
                    />
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={handleCancelEdit}
                        className="swiss-button bg-swiss-white text-swiss-black border border-swiss-black hover:bg-gray-100"
                      >
                        <span className="swiss-label">Cancel</span>
                      </button>
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        className="swiss-button"
                      >
                        <span className="swiss-label">Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xl md:text-3xl font-black tracking-tighter uppercase mb-8 leading-tight">{post.content}</p>
                )}

                {post.imageUrl && (
                  <div className="mb-8 border border-swiss-black transition-all relative group/image">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[600px] object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => setFullSizeImageUrl(post.imageUrl)}
                      className="absolute top-4 right-4 p-3 bg-swiss-black text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-swiss-red"
                      title="View Full Size"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-6 md:gap-12 pt-8 border-t border-swiss-black">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-3 transition-colors ${likedPosts.has(post.id) ? 'text-swiss-green' : 'text-swiss-black hover:text-swiss-green'}`}
                  >
                    <Heart className={`w-5 h-5 md:w-6 md:h-6 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} /> 
                    <span className="text-lg md:text-xl font-black tracking-tighter">{post.likes} LIKES</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-3 transition-colors ${expandedPostId === post.id ? 'text-swiss-green' : 'text-swiss-black hover:text-swiss-green'}`}
                  >
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" /> 
                    <span className="text-lg md:text-xl font-black tracking-tighter">{post.commentCount || 0} COMMENTS</span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {expandedPostId === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 pt-8 border-t border-gray-100 space-y-8"
                    >
                      {loadingComments[post.id] ? (
                        <div className="text-center swiss-label py-4">Loading comments...</div>
                      ) : (
                        <div className="space-y-8">
                          {comments[post.id]?.filter(c => !c.parentId).map((comment) => (
                            <div key={comment.id} className="space-y-6">
                              {/* Main Comment */}
                              <div className="flex gap-6 group/comment">
                                <UserAvatar 
                                  userId={comment.userId} 
                                  fallbackPhoto={comment.authorPhoto} 
                                  fallbackName={comment.authorName}
                                  className="h-12 w-12 border border-swiss-black flex-shrink-0 grayscale group-hover/comment:grayscale-0 transition-all"
                                />
                                <div className="flex-1">
                                  <div className="flex items-baseline justify-between mb-2">
                                    <h4 className="text-lg font-black tracking-tighter uppercase">{comment.authorName}</h4>
                                    <span className="swiss-label text-gray-400">{format(new Date(comment.createdAt), 'MMM d, p')}</span>
                                  </div>
                                  <p className="text-xl font-bold tracking-tight uppercase">{comment.content}</p>
                                  
                                  {user && (
                                    <button 
                                      onClick={() => setReplyingTo(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                      className="swiss-label text-gray-400 mt-4 flex items-center gap-2 hover:text-swiss-red transition-colors"
                                    >
                                      <CornerDownRight className="w-4 h-4" /> REPLY
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Replies */}
                              {comments[post.id]?.filter(r => r.parentId === comment.id).map(reply => (
                                <div key={reply.id} className="flex gap-6 ml-16 border-l-4 border-swiss-black pl-8">
                                  <UserAvatar 
                                    userId={reply.userId} 
                                    fallbackPhoto={reply.authorPhoto} 
                                    fallbackName={reply.authorName}
                                    className="h-10 w-10 border border-swiss-black flex-shrink-0 grayscale"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-baseline justify-between mb-2">
                                      <h4 className="text-md font-black tracking-tighter uppercase">{reply.authorName}</h4>
                                      <span className="swiss-label text-gray-400">{format(new Date(reply.createdAt), 'MMM d, p')}</span>
                                    </div>
                                    <p className="text-lg font-bold tracking-tight uppercase">{reply.content}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Reply Input */}
                              {replyingTo[comment.id] && (
                                <form onSubmit={(e) => handleCommentSubmit(e, post.id, comment.id)} className="ml-16 flex gap-4">
                                  <input 
                                    type="text"
                                    value={replyContent[comment.id] || ''}
                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                    placeholder={`REPLY TO ${comment.authorName.toUpperCase()}...`}
                                    className="flex-1 px-0 py-3 border-b border-swiss-black focus:border-swiss-red outline-none font-bold uppercase tracking-tighter"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    disabled={!replyContent[comment.id]?.trim()}
                                    className="swiss-button p-3"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </form>
                              )}
                            </div>
                          ))}
                          
                          {(!comments[post.id] || comments[post.id].length === 0) && (
                            <div className="text-center swiss-label py-4 text-gray-400">BE THE FIRST TO COMMENT.</div>
                          )}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      {user && (
                        <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-4 mt-8">
                          <input
                            type="text"
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="WRITE A COMMENT..."
                            className="flex-1 px-0 py-4 border-b border-swiss-black focus:border-swiss-red outline-none font-bold uppercase tracking-tighter text-xl"
                          />
                          <button
                            type="submit"
                            disabled={!newComment[post.id]?.trim()}
                            className="swiss-button px-8"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Post Deletion Modal */}
      <AnimatePresence>
        {postToDelete && (
          <div className="fixed inset-0 bg-swiss-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-swiss-white p-8 md:p-12 max-w-md w-full border-t-8 border-swiss-red space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-swiss-red/10 flex items-center justify-center rounded-full">
                  <AlertCircle className="w-6 h-6 text-swiss-red" />
                </div>
                <button onClick={() => setPostToDelete(null)} className="text-gray-400 hover:text-swiss-black">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Delete Post?</h3>
                <p className="swiss-label text-gray-500 leading-relaxed">
                  This will permanently remove your post from the community feed. This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setPostToDelete(null)}
                  className="swiss-button bg-swiss-white text-swiss-black border border-swiss-black hover:bg-gray-100"
                >
                  <span className="swiss-label">Cancel</span>
                </button>
                <button 
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="swiss-button bg-swiss-red border-none text-white hover:bg-swiss-black"
                >
                  <span className="swiss-label">{isDeleting ? 'DELETING...' : 'YES, DELETE'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {fullSizeImageUrl && (
          <div className="fixed inset-0 bg-swiss-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center"
            >
              <button 
                onClick={() => setFullSizeImageUrl(null)}
                className="absolute -top-12 right-0 p-3 text-white hover:text-swiss-red transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={fullSizeImageUrl} 
                alt="Full size content" 
                className="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
