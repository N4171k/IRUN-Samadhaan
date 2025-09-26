import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, ID, Query, DATABASE_ID, POSTS_COLLECTION_ID, COMMENTS_COLLECTION_ID } from '../lib/appwrite';
import Navbar from '../components/Navbar';
import ChatWithMentor from '../components/ChatWithMentor';
import {
  MessageCircle,
  ArrowLeft,
  Send,
  Users,
  Clock,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

function Community() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [postComments, setPostComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);
  
  // Fetch posts from Appwrite database
  const fetchPosts = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        POSTS_COLLECTION_ID,
        [
          Query.orderDesc('$createdAt')
        ]
      );
      console.log('Fetched posts:', response.documents);
      setCommunityPosts(response.documents);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to dummy data if database fails
      setCommunityPosts([
        {
          $id: '1',
          author: "Alex",
          content: "Just finished my Psych Test prep, feeling confident! Who else preparing to GTO tasks next week?",
          $createdAt: new Date().toISOString(),
          userId: 'demo-user'
        },
        {
          $id: '2',
          author: "Bob", 
          content: "Group Discussion practice was tough today. Any good resources for current affairs?",
          $createdAt: new Date().toISOString(),
          userId: 'demo-user'
        },
        {
          $id: '3',
          author: "Sarah", 
          content: "Successfully completed my SSB interview! The mock tests here really helped. Thank you IRUN community!",
          $createdAt: new Date().toISOString(),
          userId: 'demo-user'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        COMMENTS_COLLECTION_ID, 
        [
          Query.equal('postId', postId),
          Query.orderDesc('$createdAt')
        ]
      );
      console.log('Fetched comments:', response.documents);
      setPostComments(response.documents);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPostComments([]);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await account.get();
        setUserDetails(user);
        // Fetch posts after user is authenticated
        fetchPosts();
      } catch (err) {
        console.error('User not logged in:', err);
        navigate('/login');
      }
    }
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const handlePost = async () => {
    if (postContent.trim() && userDetails) {
      try {
        const newPost = await databases.createDocument(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          ID.unique(),
          {
            content: postContent,
            author: anonymousMode ? "Anonymous" : (userDetails.name || userDetails.email),
            userId: userDetails.$id,
            isAnonymous: anonymousMode
          }
        );
        
        // Add the new post to the local state
        setCommunityPosts(prev => [newPost, ...prev]);
        setPostContent('');
        alert('Post shared to community!');
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to post. Please try again.');
      }
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && expandedPost && userDetails) {
      try {
        const newCommentDoc = await databases.createDocument(
          DATABASE_ID,
          COMMENTS_COLLECTION_ID,
          ID.unique(),
          {
            content: newComment,
            author: anonymousMode ? "Anonymous" : (userDetails.name || userDetails.email),
            userId: userDetails.$id,
            postId: expandedPost.$id,
            isAnonymous: anonymousMode
          }
        );
        
        // Add the new comment to local state
        setPostComments(prev => [...prev, newCommentDoc]);
        setNewComment('');
        alert('Comment added!');
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  const handleShowComments = () => {
    if (expandedPost) {
      fetchComments(expandedPost.$id);
      setShowComments(true);
    }
  };

  const handleBackToPost = () => {
    setShowComments(false);
    setPostComments([]);
  };

  // Handle anonymous mode toggle
  const toggleAnonymousMode = () => {
    setAnonymousMode(!anonymousMode);
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  if (!userDetails) {
    return <div className="loading-container">Loading user...</div>;
  }

  return (
    <div className="glassmorphic-page-layout">
      <Navbar userDetails={userDetails} onLogout={handleLogout} />
      
      <div className="glassmorphic-community-wrapper">
        <div className="glassmorphic-community-main">
          <div className="glassmorphic-community-header">
            <h2>IRUN Community</h2>
            <div className="glassmorphic-community-stats">
              <div className="community-stat">
                <span className="stat-value">{communityPosts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="community-stat">
                <span className="stat-value">2.3k</span>
                <span className="stat-label">Members</span>
              </div>
            </div>
          </div>

          <div className="glassmorphic-community-content">
            {loading ? (
              <div className="glassmorphic-loading-card">
                <div className="loading-spinner"></div>
                <p>Loading community posts...</p>
              </div>
            ) : !expandedPost ? (
              <div className="glassmorphic-community-posts">
                {communityPosts && communityPosts.length > 0 ? (
                  communityPosts.map(post => (
                  <div key={post.$id} className="glassmorphic-community-post" onClick={() => setExpandedPost(post)}>
                    <div className="glassmorphic-post-header">
                      <div className="glassmorphic-avatar">{post.isAnonymous ? "🕶️" : "👤"}</div>
                      <div className="glassmorphic-post-info">
                        <h4 className="glassmorphic-post-author">
                          {post.author}
                          {post.isAnonymous && <span className="glassmorphic-anonymous-badge">Anonymous</span>}
                        </h4>
                        <span className="glassmorphic-post-timestamp">{formatTimestamp(post.$createdAt || post.createdAt)}</span>
                      </div>
                      <div className="glassmorphic-post-actions">
                        <MessageCircle size={18} />
                      </div>
                    </div>
                    <div className="glassmorphic-post-content">
                      {post.content}
                    </div>
                    <div className="glassmorphic-post-footer">
                      <div className="glassmorphic-engagement">
                        <Users size={16} />
                        <span>24</span>
                      </div>
                      <div className="glassmorphic-engagement">
                        <MessageCircle size={16} />
                        <span>8</span>
                      </div>
                      <div className="glassmorphic-engagement">
                        <Clock size={16} />
                        <span>{formatTimestamp(post.$createdAt || post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="glassmorphic-no-posts">
                    <MessageCircle size={48} />
                    <h3>No posts yet</h3>
                    <p>Be the first to share something with the community!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glassmorphic-expanded-post-view">
                {!showComments ? (
                  <>
                    <button className="glassmorphic-back-button" onClick={() => setExpandedPost(null)}>
                      <ArrowLeft size={18} />
                      Back to Community
                    </button>
                    
                    <div className="glassmorphic-expanded-post">
                      <div className="glassmorphic-post-header">
                        <div className="glassmorphic-avatar">{expandedPost.isAnonymous ? "🕶️" : "👤"}</div>
                        <div className="glassmorphic-post-info">
                          <h4 className="glassmorphic-post-author">
                            {expandedPost.author}
                            {expandedPost.isAnonymous && <span className="glassmorphic-anonymous-badge">Anonymous</span>}
                          </h4>
                          <span className="glassmorphic-post-timestamp">{formatTimestamp(expandedPost.$createdAt || expandedPost.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="glassmorphic-expanded-content">
                        <div className="glassmorphic-post-text">
                          {expandedPost.content.split('\n').map((line, index) => (
                            <p key={index} className="post-paragraph">
                              {line || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      <div className="glassmorphic-comment-section">
                        <div className="glassmorphic-comment-input-area">
                          <div className="glassmorphic-avatar-small">{anonymousMode ? "🕶️" : "👤"}</div>
                          <input
                            type="text"
                            placeholder={anonymousMode ? "Add your comment anonymously..." : "Add your comment..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="glassmorphic-comment-input"
                          />
                          
                          <div className="glassmorphic-comment-controls">
                            <label className="glassmorphic-anonymous-toggle">
                              <input
                                type="checkbox"
                                checked={anonymousMode}
                                onChange={toggleAnonymousMode}
                              />
                              {anonymousMode ? <EyeOff size={16} /> : <Eye size={16} />}
                              <span>Anonymous</span>
                            </label>
                            
                            <div className="glassmorphic-comment-actions">
                              <button className="glassmorphic-view-comments-btn" onClick={handleShowComments}>
                                <MessageCircle size={16} />
                                View Comments
                              </button>
                              <button className="glassmorphic-post-comment-btn" onClick={handleAddComment}>
                                <Send size={16} />
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glassmorphic-comments-view">
                    <button className="glassmorphic-back-button" onClick={handleBackToPost}>
                      <ArrowLeft size={18} />
                      Back to Post
                    </button>
                    
                    <div className="glassmorphic-comments-header">
                      <h3>Comments & Discussion</h3>
                      <div className="glassmorphic-comments-count">
                        <MessageCircle size={18} />
                        <span>{postComments.length} Comments</span>
                      </div>
                    </div>
                    
                    <div className="glassmorphic-original-post-mini">
                      <div className="glassmorphic-post-header">
                        <div className="glassmorphic-avatar-small">{expandedPost.isAnonymous ? "🕶️" : "👤"}</div>
                        <div className="glassmorphic-post-info">
                          <h5 className="glassmorphic-post-author">
                            {expandedPost.author}
                            {expandedPost.isAnonymous && <span className="glassmorphic-anonymous-badge">Anonymous</span>}
                          </h5>
                          <span className="glassmorphic-post-snippet">{expandedPost.content.substring(0, 100)}...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glassmorphic-comments-list">
                      {postComments.length > 0 ? (
                        postComments.map(comment => (
                          <div key={comment.$id} className="glassmorphic-comment-card">
                            <div className="glassmorphic-comment-header">
                              <div className="glassmorphic-avatar-small">{comment.isAnonymous ? "🕶️" : "👤"}</div>
                              <div className="glassmorphic-comment-info">
                                <h5 className="glassmorphic-comment-author">
                                  {comment.author}
                                  {comment.isAnonymous && <span className="glassmorphic-anonymous-badge">Anonymous</span>}
                                </h5>
                                <span className="glassmorphic-comment-time">{formatTimestamp(comment.$createdAt)}</span>
                              </div>
                            </div>
                            <div className="glassmorphic-comment-content">
                              {comment.content}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="glassmorphic-no-comments">
                          <MessageCircle size={48} />
                          <h4>No comments yet</h4>
                          <p>Be the first to share your thoughts!</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="glassmorphic-floating-comment-input">
                      <div className="glassmorphic-comment-input-card">
                        <div className="glassmorphic-avatar-small">{anonymousMode ? "🕶️" : "👤"}</div>
                        <div className="glassmorphic-input-section">
                          <input
                            type="text"
                            placeholder={anonymousMode ? "Add your comment anonymously..." : "Add your comment..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="glassmorphic-floating-input"
                          />
                          
                          <div className="glassmorphic-floating-actions">
                            <label className="glassmorphic-floating-anonymous-toggle">
                              <input
                                type="checkbox"
                                checked={anonymousMode}
                                onChange={toggleAnonymousMode}
                              />
                              {anonymousMode ? <EyeOff size={14} /> : <Eye size={14} />}
                              <span>Anonymous</span>
                            </label>
                            
                            <button className="glassmorphic-floating-post-btn" onClick={handleAddComment}>
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="glassmorphic-community-sidebar">
          <div className="glassmorphic-create-post-card">
            <div className="glassmorphic-create-post-header">
              <div className="glassmorphic-avatar">{anonymousMode ? "🕶️" : "👤"}</div>
              <h4>What's on your mind?</h4>
            </div>
            
            <textarea
              className="glassmorphic-post-textarea"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={anonymousMode ? "Share your thoughts anonymously..." : "Share your thoughts with the community..."}
              rows="6"
            />
            
            <div className="glassmorphic-post-controls">
              <label className="glassmorphic-anonymous-toggle">
                <input
                  type="checkbox"
                  checked={anonymousMode}
                  onChange={toggleAnonymousMode}
                />
                {anonymousMode ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>Post Anonymously</span>
              </label>
              
              <button className="glassmorphic-post-button" onClick={handlePost}>
                <Send size={16} />
                Share Post
              </button>
            </div>
          </div>

          <div className="glassmorphic-community-stats-card">
            <h4>Community Insights</h4>
            <div className="glassmorphic-stats-grid">
              <div className="glassmorphic-stat-item">
                <Users size={20} />
                <div className="stat-details">
                  <span className="stat-number">2,347</span>
                  <span className="stat-label">Active Members</span>
                </div>
              </div>
              <div className="glassmorphic-stat-item">
                <MessageCircle size={20} />
                <div className="stat-details">
                  <span className="stat-number">1,284</span>
                  <span className="stat-label">Discussions</span>
                </div>
              </div>
              <div className="glassmorphic-stat-item">
                <Clock size={20} />
                <div className="stat-details">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
          </div>
          
        </aside>
      </div>
      
      {/* Chat with Mentor Component */}
      <ChatWithMentor />
    </div>
  );
}

export default Community;