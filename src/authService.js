const BASE_URL = "http://localhost:3200/auth"; // Base API URL
// const BASE_URL = "http://192.168.0.104:3200/auth"; // Base API URL

// New base URL for images and videos
export const MEDIA_BASE_URL = "http://localhost:3200"; // Remove /uploads from base URL
// const MEDIA_BASE_URL = "http://192.168.0.104:3200/uploads"; 
// Add this function to parse JWT token
export const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Add this function to check if user is an admin
export const isUserAdmin = () => {
  const role = localStorage.getItem('userRole');
  return role === 'admin';
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Check if the error is related to suspension
      if (errorData.error && errorData.error.includes('suspended')) {
        throw new Error(errorData.error); // Use the full suspension message from the backend
      }
      throw new Error(errorData.error || "Login failed");
    }

    const result = await response.json();

    // Only store token and role
    localStorage.setItem("token", result.token);
    localStorage.setItem("userRole", result.role);

    return result;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch profile");
  }

  const data = await response.json();

  // Add full URLs for media files
  if (data.userProfile) {
    if (data.userProfile.profilePicture) {
      data.userProfile.profilePicture = `${MEDIA_BASE_URL}${data.userProfile.profilePicture}`;
    }
    if (data.userProfile.coverPhoto) {
      data.userProfile.coverPhoto = `${MEDIA_BASE_URL}${data.userProfile.coverPhoto}`;
    }
  }

  return data;
}

export async function updateProfile(profileData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const formData = new FormData();

  // Add regular fields
  formData.append('firstName', profileData.firstName || '');
  formData.append('lastName', profileData.lastName || '');
  formData.append('phoneNumber', profileData.phoneNumber || '');
  formData.append('address', profileData.address || '');
  if (profileData.dateOfBirth) {
    formData.append('dateOfBirth', profileData.dateOfBirth);
  }

  // Add files if they exist
  if (profileData.profilePicture instanceof File) {
    formData.append('profilePicture', profileData.profilePicture);
  }
  if (profileData.coverPhoto instanceof File) {
    formData.append('coverPhoto', profileData.coverPhoto);
  }

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  const data = await response.json();

  // Add full URLs for media files in the response
  if (data.user) {
    if (data.user.profilePicture) {
      data.user.profilePicture = `${MEDIA_BASE_URL}${data.user.profilePicture}`;
    }
    if (data.user.coverPhoto) {
      data.user.coverPhoto = `${MEDIA_BASE_URL}${data.user.coverPhoto}`;
    }
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    // Throw error with the error message from the server
    throw { 
      response: {
        status: response.status,
        data: data
      }
    };
  }
  
  return data;
}

export async function verifyEmail(email, code) {
  try {
    const response = await fetch(`${BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }), // Matches the React version
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Verification failed");
    }

    return data;
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}

export const upgradeToCreator = async (formData) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  // Get the social links from FormData and parse them
  const socialLinksString = formData.get('socialLinks');
  if (socialLinksString) {
    // Remove the old social links from FormData
    formData.delete('socialLinks');
    // Add it back as a proper string field
    formData.append('socialLinks', socialLinksString);
  }

  const response = await fetch(`${BASE_URL}/upgrade`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to upgrade to creator');
  }

  const result = await response.json();
  return result;
};


// New getProfile function to fetch user profile
export const getCreatorProfile = async () => {
  const token = localStorage.getItem('token'); // Fetch the token from localStorage

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/cprofile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to fetch profile');
  }

  const result = await response.json();
  return result;
};

// New function to edit the Creator Profile
export const editCreatorProfile = async (data) => {
  const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/editcprofile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to update profile');
  }

  const result = await response.json();
  return result;
};


export const createPost = async (data) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  try {
    // Check if data is already a FormData object
    let formData;
    if (data instanceof FormData) {
      formData = data;
      
      // Verify that title and description are not undefined
      const title = formData.get('title');
      const description = formData.get('description');
      
      if (!title || title === 'undefined') {
        throw new Error('Title is required and cannot be undefined');
      }
      
      if (!description || description === 'undefined') {
        throw new Error('Description is required and cannot be undefined');
      }
    } else {
      // Create FormData if not already a FormData object
      formData = new FormData();
      formData.append('title', data.title || '');
      formData.append('description', data.description || '');
      formData.append('detailedDescription', data.detailedDescription || '');
      formData.append('amount', data.amount || '');
      formData.append('remarks', data.remarks || '');

      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.video) {
        formData.append('video', data.video);
      }
      if (data.audio) {
        formData.append('audio', data.audio);
      }
    }

    // Log the actual data being sent
    console.log('Sending post data to server:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(`${BASE_URL}/createpost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // No need for 'Content-Type', FormData handles it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server Error:', errorText);
      throw new Error('Failed to create post: ' + errorText);
    }

    const result = await response.json();
    // Debug log to see the exact response structure
    console.log('Create post response:', result);
    
    // Ensure we return a consistent structure regardless of what the server returns
    return {
      post: result.post || result.data || null,
      message: result.message || 'Post created successfully'
    };
  } catch (error) {
    console.error('Error in createPost:', error);
    throw new Error(error.message || 'Unknown error occurred');
  }
};

// Helper function to safely parse copyright info
const safelyParseJSONCopyright = (jsonString) => {
  if (!jsonString) return null;
  
  try {
    // Try normal parsing first
    return JSON.parse(jsonString);
  } catch (jsonError) {
    console.warn('Error parsing copyright JSON, attempting to extract partial data:', jsonError);
    
    try {
      // Try to extract song info using regex
      const songMatch = jsonString.match(/"title":"([^"]+)","artist":"([^"]+)"/);
      if (songMatch) {
        return {
          isDetected: true,
          songInfo: {
            title: songMatch[1] || 'Unknown',
            artist: songMatch[2] || 'Unknown',
          },
          error: 'Incomplete copyright data'
        };
      }
      
      // If we can't extract song info, return a generic placeholder
      return {
        isDetected: true,
        songInfo: {
          title: 'Unknown Song',
          artist: 'Unknown Artist',
        },
        error: 'Malformed copyright data'
      };
    } catch (regexError) {
      console.error('Failed to extract partial copyright data:', regexError);
      return {
        isDetected: false,
        error: 'Could not parse copyright data'
      };
    }
  }
};

export const fetchUserProfileAndPosts = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  try {
    const response = await fetch(`${BASE_URL}/viewuserpost`, { // Remove the userId query parameter
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Add the token here
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Construct full URLs for images and videos
    const userWithMedia = {
      ...data,
      posts: data.posts.map(post => {
        let parsedCopyrightInfo = null;
        if (post.copyrightInfo) {
          try {
            // Log the raw string to debug malformed JSON
            console.debug(`Copyright info for post ${post.id}:`, post.copyrightInfo);
            parsedCopyrightInfo = safelyParseJSONCopyright(post.copyrightInfo);
          } catch (e) {
            console.warn(`Failed to parse copyright info for post ${post.id}:`, e);
            // Try to fix common JSON parse errors - unescaped quotes, missing quotes, unterminated strings
            try {
              // Remove the offending JSON and use a placeholder object
              parsedCopyrightInfo = { 
                isDetected: false, 
                error: "Corrupted copyright data", 
                originalData: post.copyrightInfo.substring(0, 50) + "..." 
              };
            } catch(err) {
              console.error("Could not create placeholder for corrupted copyright data:", err);
            }
          }
        }
        
        return {
          ...post,
          image: post.image ? `${MEDIA_BASE_URL}/uploads/${post.image}` : null,
          video: post.video ? `${MEDIA_BASE_URL}/uploads/${post.video}` : null,
          audio: post.audio ? `${MEDIA_BASE_URL}/uploads/audio/${post.audio}` : null,
          copyrightInfo: parsedCopyrightInfo
        };
      }),
    };

    return userWithMedia;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};

export const editPost = async (postId, postData) => { 
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  try {
    // Create a FormData object for file uploads
    const formData = new FormData();
    formData.append('postId', postId);
    
    // Add all other post data
    Object.keys(postData).forEach(key => {
      // Skip files, they'll be handled separately
      if (key !== 'image' && key !== 'video' && key !== 'audio') {
        if (postData[key] !== null && postData[key] !== undefined) {
          formData.append(key, postData[key]);
        }
      }
    });
    
    // Add files if they exist
    if (postData.image instanceof File) {
      formData.append('image', postData.image);
    }
    
    if (postData.video instanceof File) {
      formData.append('video', postData.video);
    }
    
    if (postData.audio instanceof File) {
      formData.append('audio', postData.audio);
    }

    const response = await fetch(`${BASE_URL}/editpost`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header when sending FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', errorData);
      throw new Error(errorData.error || `Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Edit Post error:', error);
    throw error; // Re-throw to allow proper handling by the caller
  }
};


// Delete a post
export const deletePost = async (postId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  try {
    const response = await fetch(`${BASE_URL}/delete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete Post error:', error);
    return null;
  }
};


export const fetchAllPosts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/allpost`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const data = await response.json();

    // Filter out rejected posts and add media URLs
    const postsWithMedia = data
      .filter(post => post.status !== 'rejected')
      .map(post => {
        let parsedCopyrightInfo = null;
        if (post.copyrightInfo) {
          try {
            // Log the raw string to debug malformed JSON
            console.debug(`Copyright info for post ${post.id}:`, post.copyrightInfo);
            parsedCopyrightInfo = safelyParseJSONCopyright(post.copyrightInfo);
          } catch (e) {
            console.warn(`Failed to parse copyright info for post ${post.id}:`, e);
            // Try to fix common JSON parse errors - unescaped quotes, missing quotes, unterminated strings
            try {
              // Remove the offending JSON and use a placeholder object
              parsedCopyrightInfo = { 
                isDetected: false, 
                error: "Corrupted copyright data", 
                originalData: post.copyrightInfo.substring(0, 50) + "..." 
              };
            } catch(err) {
              console.error("Could not create placeholder for corrupted copyright data:", err);
            }
          }
        }
        
        return {
          ...post,
          image: post.image ? `${MEDIA_BASE_URL}/uploads/${post.image}` : null,
          video: post.video ? `${MEDIA_BASE_URL}/uploads/${post.video}` : null,
          audio: post.audio ? `${MEDIA_BASE_URL}/uploads/audio/${post.audio}` : null,
          copyrightInfo: parsedCopyrightInfo,
          user: post.user ? {
            ...post.user,
            profilePicture: post.user.profilePicture ? `${MEDIA_BASE_URL}${post.user.profilePicture}` : null,
            coverPhoto: post.user.coverPhoto ? `${MEDIA_BASE_URL}${post.user.coverPhoto}` : null,
            creatorProfile: post.user.creatorProfile ? {
              ...post.user.creatorProfile,
              portfolioFile: post.user.creatorProfile.portfolioFile ? `${MEDIA_BASE_URL}${post.user.creatorProfile.portfolioFile}` : null,
              resumeFile: post.user.creatorProfile.resumeFile ? `${MEDIA_BASE_URL}${post.user.creatorProfile.resumeFile}` : null
            } : null
          } : null
        };
      });

    return postsWithMedia;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const fetchPostDetails = async (postId) => {
  try {
    const response = await fetch(`${BASE_URL}/viewpost?postId=${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post details');
    }
    const data = await response.json();

    // Parse copyright info safely
    let parsedCopyrightInfo = null;
    if (data.copyrightInfo) {
      try {
        // Log the raw string to debug malformed JSON
        console.debug(`Copyright info for post ${postId}:`, data.copyrightInfo);
        parsedCopyrightInfo = safelyParseJSONCopyright(data.copyrightInfo);
      } catch (e) {
        console.warn(`Failed to parse copyright info for post ${postId}:`, e);
        // Create a placeholder object for the corrupted data
        parsedCopyrightInfo = { 
          isDetected: false, 
          error: "Corrupted copyright data", 
          originalData: data.copyrightInfo.substring(0, 50) + "..." 
        };
      }
    }

    // Construct full URLs for images and videos
    return {
      ...data,
      image: data.image ? `${MEDIA_BASE_URL}/uploads/${data.image}` : null,
      video: data.video ? `${MEDIA_BASE_URL}/uploads/${data.video}` : null,
      audio: data.audio ? `${MEDIA_BASE_URL}/uploads/audio/${data.audio}` : null,
      copyrightInfo: parsedCopyrightInfo,
      user: data.user ? {
        ...data.user,
        profilePicture: data.user.profilePicture ? `${MEDIA_BASE_URL}${data.user.profilePicture}` : null,
        coverPhoto: data.user.coverPhoto ? `${MEDIA_BASE_URL}${data.user.coverPhoto}` : null,
        creatorProfile: data.user.creatorProfile ? {
          ...data.user.creatorProfile,
          portfolioFile: data.user.creatorProfile.portfolioFile ? `${MEDIA_BASE_URL}${data.user.creatorProfile.portfolioFile}` : null,
          resumeFile: data.user.creatorProfile.resumeFile ? `${MEDIA_BASE_URL}${data.user.creatorProfile.resumeFile}` : null
        } : null
      } : null
    };
  } catch (error) {
    console.error("Error fetching post details:", error);
    throw error;
  }
};

export const sendMessage = async (receiverId, content) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/sendmessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId, content }),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to send message');
  }

  return await response.json();
};

export const fetchMessages = async (otherUserId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/messages/${otherUserId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to fetch messages');
  }

  return await response.json();
};

export const fetchUsersWithChatHistory = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/chat-users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to fetch chat history');
  }

  return await response.json();
};

export const initiatePayment = async (amount, description, remarks, clientId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  // Convert amount from dollars to cents
  const amountInCents = amount * 100;

  const response = await fetch(`${BASE_URL}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      amount: amountInCents, 
      description, 
      remarks, 
      clientId // Include clientId in the request body
    }),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to initiate payment');
  }

  return await response.json();
};

// Add this function to handle logout
export const logoutUser = () => {
  try {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    // Clear any other stored data if needed
    sessionStorage.removeItem('lastViewedPost');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

export const checkPaymentStatus = async (referenceNumber) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/payment/status?referenceNumber=${referenceNumber}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to check payment status');
  }

  return await response.json();
};

// Function to fetch payments for the authenticated user
export const fetchUserPayments = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/payments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to fetch user payments');
  }

  return await response.json();
};

// Function to update the order status of a payment from the user side
export const updateUserOrderStatus = async (referenceNumber, newStatus) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/payment/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      referenceNumber,
      newStatus,
    }),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to update order status');
  }

  return await response.json();
};

// Function to fetch payments for the authenticated client
export const fetchClientPayments = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/client/payments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to fetch client payments');
  }

  return await response.json();
};

// Function to update the order status of a payment from the client side
export const updateClientOrderStatus = async (referenceNumber, newStatus) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/client/payment/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      referenceNumber,
      newStatus,
    }),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to update order status');
  }

  return await response.json();
};

export const submitRating = async (userId, paymentId, rating, review) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${BASE_URL}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        paymentId,
        rating,
        review
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit rating');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to submit rating');
  }
};

export const fetchCreatorRatings = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/ratings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch ratings');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch ratings: ${error.message}`);
  }
};

// New function to fetch ratings for any creator by ID
export const fetchCreatorRatingsById = async (creatorId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/ratings/${creatorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch ratings');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch ratings: ${error.message}`);
  }
};

// Function to approve/reject post (admin only)
export const updatePostStatus = async (postId, status) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/post/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        postId,
        status
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update post status');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to update post status: ${error.message}`);
  }
};

// Function to delete post (admin only)
export const deletePostAdmin = async (postId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/post/admin`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ postId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete post');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

// New function for admin to fetch ALL posts including rejected ones
export const fetchAllPostsAdmin = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/posts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch posts');
    }

    const data = await response.json();
    
    // Add media URLs to all posts
    const postsWithMedia = data.map(post => ({
      ...post,
      image: post.image ? `${MEDIA_BASE_URL}/uploads/${post.image}` : null,
      video: post.video ? `${MEDIA_BASE_URL}/uploads/${post.video}` : null,
    }));

    return postsWithMedia;
  } catch (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

// Function to fetch all users (admin only)
export const fetchAllUsers = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

// Add this new function
export async function loginWithGoogle(accessToken) {
  try {
    const response = await fetch(`${BASE_URL}/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to login with Google");
    }

    return await response.json();
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
}

// ==================== ANALYTICS & ENGAGEMENT TRACKING FUNCTIONS ====================

// Track profile view
export const trackProfileView = async (creatorId) => {
  try {
    const response = await fetch(`${BASE_URL}/track/profile-view/${creatorId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include token if available for authenticated users
      ...(localStorage.getItem('token') && {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    });

    if (!response.ok) {
      console.warn('Failed to track profile view:', response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error tracking profile view:', error);
    return false; // Fail silently - don't affect user experience
  }
};

// Track post view
export const trackPostView = async (postId) => {
  try {
    const response = await fetch(`${BASE_URL}/track/post-view/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include token if available
      ...(localStorage.getItem('token') && {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    });

    if (!response.ok) {
      console.warn('Failed to track post view:', response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error tracking post view:', error);
    return false; // Fail silently
  }
};

// Track audio play with enhanced metadata
export const trackAudioPlay = async (postId, duration) => {
  try {
    // Get device and browser details
    const deviceInfo = {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const response = await fetch(`${BASE_URL}/track/audio-play/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify({ 
        duration,
        deviceInfo,
        referrer: document.referrer,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.warn('Failed to track audio play:', response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error tracking audio play:', error);
    return false; // Fail silently
  }
};

// Track click-through with enhanced metadata
export const trackClickThrough = async (sourceType, sourceId, destinationType, destinationId = null) => {
  try {
    // Get device and browser details
    const deviceInfo = {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Get page session time
    const sessionStartTime = sessionStorage.getItem('pageSessionStart');
    let timeOnPage = null;
    
    if (sessionStartTime) {
      timeOnPage = Math.floor((Date.now() - parseInt(sessionStartTime)) / 1000); // in seconds
    }

    const response = await fetch(`${BASE_URL}/track/click-through`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      },
      body: JSON.stringify({ 
        sourceType, // 'post' or 'profile'
        sourceId,
        destinationType,
        destinationId,
        exitUrl: destinationId ? `/${destinationType}/${destinationId}` : null,
        deviceInfo,
        referrer: document.referrer,
        currentUrl: window.location.href,
        timeOnPage,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.warn('Failed to track click-through:', response.statusText);
      return false;
    }
    
    // Reset session start time for new page
    sessionStorage.setItem('pageSessionStart', Date.now().toString());
    
    return true;
  } catch (error) {
    console.warn('Error tracking click-through:', error);
    return false; // Fail silently
  }
};

// Get creator analytics
export const getCreatorAnalytics = async (creatorId, startDate, endDate) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required to access analytics');
  }

  try {
    // Build the URL with optional parameters
    let url = `${BASE_URL}/analytics`;
    
    // Add creatorId if provided (for admins viewing other creators' analytics)
    if (creatorId) {
      url += `/${creatorId}`;
    }
    
    // Add date range if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error(error.message || 'Failed to fetch analytics data');
  }
};

// ==================== NOTIFICATION FUNCTIONS ====================

// Fetch user's notifications
export const fetchUserNotifications = async (limit = 20, offset = 0, includeRead = false) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required to access notifications');
  }

  try {
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('offset', offset);
    params.append('includeRead', includeRead);
    
    const response = await fetch(`${BASE_URL}/notifications?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.message || 'Failed to fetch notifications');
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.message || 'Failed to update notification');
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(error.message || 'Failed to update notifications');
  }
};

// ==================== ADMIN COPYRIGHT MANAGEMENT FUNCTIONS ====================

// Get users under copyright review (admin only)
export const fetchUsersUnderReview = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/users/review`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users under review');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch users under review: ${error.message}`);
  }
};

// Review a user's copyright status (admin only)
export const reviewUserCopyrightStatus = async (userId, action, duration) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Validate action
  if (!['clear', 'warn', 'suspend', 'unsuspend'].includes(action)) {
    throw new Error('Invalid action. Must be "clear", "warn", "suspend", or "unsuspend"');
  }
  
  // Make sure duration is provided for warn and suspend actions
  if ((action === 'warn' || action === 'suspend') && !duration) {
    throw new Error('Duration is required for warn and suspend actions');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/copyright-review`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        action,
        duration: duration || undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to review user');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to ${action} user: ${error.message}`);
  }
};

// Get users with active restrictions (admin only)
export const fetchUsersWithRestrictions = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/users/restricted`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users with restrictions');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch users with restrictions: ${error.message}`);
  }
};

// ==================== ADMIN ANALYTICS FUNCTIONS ====================

// Get admin revenue analytics
export const getAdminRevenueAnalytics = async (startDate, endDate, groupBy = 'day', includeTransactions = false) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (groupBy) params.append('groupBy', groupBy);
    if (includeTransactions) params.append('includeTransactions', 'true');
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const endpoint = `${BASE_URL}/admin/analytics/revenue${queryString}`;
    
    console.log('Fetching admin revenue analytics:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Revenue analytics error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch revenue analytics');
    }

    const data = await response.json();
    console.log('Admin revenue analytics raw response:', data);
    
    // Handle different response formats between environments
    // Ensure we always return consistent data structure
    return {
      totalTransactions: data.totalTransactions || 0,
      totalRevenue: typeof data.totalRevenue === 'number' ? data.totalRevenue : 0,
      claimedRevenue: typeof data.claimedRevenue === 'number' ? data.claimedRevenue : 0,
      unclaimedRevenue: typeof data.unclaimedRevenue === 'number' ? data.unclaimedRevenue : 0,
      revenueTimeline: Array.isArray(data.revenueTimeline) ? data.revenueTimeline : [],
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      currency: data.currency || 'USD'
    };
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw new Error(error.message || 'Failed to fetch revenue analytics');
  }
};

// Get admin user growth analytics
export const getAdminUserGrowthAnalytics = async (startDate, endDate, groupBy = 'day') => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (groupBy) params.append('groupBy', groupBy);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await fetch(`${BASE_URL}/admin/analytics/users${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user growth analytics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user growth analytics:', error);
    throw new Error(error.message || 'Failed to fetch user growth analytics');
  }
};

// Get admin creator performance analytics
export const getAdminCreatorPerformance = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/analytics/creators`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch creator performance data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching creator performance:', error);
    throw new Error(error.message || 'Failed to fetch creator performance data');
  }
};

// Get admin content performance analytics
export const getAdminContentPerformance = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/analytics/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch content performance data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching content performance:', error);
    throw new Error(error.message || 'Failed to fetch content performance data');
  }
};

// Get current fee percentage
export const getCurrentFeePercentage = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/settings/fee`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch fee percentage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fee percentage:', error);
    throw new Error(error.message || 'Failed to fetch fee percentage');
  }
};

// Update fee percentage
export const updateFeePercentage = async (feePercentage) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Validate fee percentage
    if (typeof feePercentage !== 'number' || feePercentage < 0 || feePercentage > 50) {
      throw new Error('Fee percentage must be a number between 0 and 50');
    }

    const response = await fetch(`${BASE_URL}/admin/settings/fee`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feePercentage })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update fee percentage');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating fee percentage:', error);
    throw new Error(error.message || 'Failed to update fee percentage');
  }
};

// Claim admin fees
export const claimAdminFees = async (paymentIds = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Handle single ID or array of IDs
    let requestBody = {};
    
    if (paymentIds) {
      // If it's a single ID, convert to array
      if (!Array.isArray(paymentIds)) {
        requestBody = { paymentIds: [paymentIds] };
      } else {
        requestBody = { paymentIds };
      }
    }
    
    const response = await fetch(`${BASE_URL}/admin/claim-fees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to claim fees');
    }

    return await response.json();
  } catch (error) {
    console.error('Error claiming fees:', error);
    throw new Error(error.message || 'Failed to claim fees');
  }
};

// Fix admin fees for existing payments
export const fixAdminFees = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/fix-admin-fees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fix admin fees');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fixing admin fees:', error);
    throw new Error(error.message || 'Failed to fix admin fees');
  }
};

// Add these two functions after the verifyEmail function

export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send reset code");
    }

    return await response.json();
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}

export async function resetPassword(email, resetCode, newPassword) {
  try {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resetCode, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to reset password");
    }

    return await response.json();
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

// ==================== USER REPORTING FUNCTIONS ====================

// Submit a report about a user
export const reportUser = async (reportData, evidenceImage = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required to report a user');
  }

  try {
    // Create form data to handle the file upload
    const formData = new FormData();
    formData.append('reportedUserId', reportData.reportedUserId);
    formData.append('reason', reportData.reason);
    formData.append('category', reportData.category);
    
    if (reportData.details) {
      formData.append('details', reportData.details);
    }
    
    // Add image if provided
    if (evidenceImage instanceof File) {
      formData.append('evidenceImage', evidenceImage);
    }

    const response = await fetch(`${BASE_URL}/report-user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reporting user:', error);
    throw new Error(error.message || 'Failed to submit report');
  }
};

// Get all reports (admin only)
export const getReports = async (status = null, page = 1, limit = 20) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    let url = `${BASE_URL}/admin/reports?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch reports');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw new Error(error.message || 'Failed to fetch reports');
  }
};

// Get detailed report information (admin only)
export const getReportDetails = async (reportId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch report details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching report details:', error);
    throw new Error(error.message || 'Failed to fetch report details');
  }
};

// Update report status and take action (admin only)
export const updateReportStatus = async (reportId, updateData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating report:', error);
    throw new Error(error.message || 'Failed to update report');
  }
};

// Delete a report (admin only)
export const deleteReport = async (reportId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/reports/${reportId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error(error.message || 'Failed to delete report');
  }
};

// ==================== CREATOR VERIFICATION FUNCTIONS ====================

// Apply for creator verification
export const applyForVerification = async (reason, validIdFile) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required to apply for verification');
  }

  try {
    // Create form data to handle the file upload
    const formData = new FormData();
    
    if (reason) {
      formData.append('reason', reason);
    }
    
    // Add valid ID file
    if (validIdFile instanceof File) {
      formData.append('validId', validIdFile);
    } else {
      throw new Error('Valid ID document is required');
    }

    const response = await fetch(`${BASE_URL}/verification/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit verification request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying for verification:', error);
    throw new Error(error.message || 'Failed to submit verification request');
  }
};

// Get pending verification requests (admin only)
export const getPendingVerificationRequests = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/verifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch verification requests');
    }

    const data = await response.json();
    
    // Add media URLs for profile pictures and ID documents
    const requestsWithUrls = {
      ...data,
      pendingRequests: data.pendingRequests.map(request => ({
        ...request,
        user: {
          ...request.user,
          profilePicture: request.user.profilePicture ? `${MEDIA_BASE_URL}${request.user.profilePicture}` : null
        },
        validIdDocument: request.validIdDocument ? `${MEDIA_BASE_URL}/uploads/verification/${request.validIdDocument}` : null
      }))
    };
    
    return requestsWithUrls;
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    throw new Error(error.message || 'Failed to fetch verification requests');
  }
};

// Review verification request (admin only)
export const reviewVerificationRequest = async (creatorProfileId, approve, rejectionReason = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  // Validate inputs
  if (typeof approve !== 'boolean') {
    throw new Error('Approve parameter must be a boolean');
  }
  
  if (!approve && !rejectionReason) {
    throw new Error('Rejection reason is required when rejecting a verification request');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/verifications/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creatorProfileId,
        approve,
        rejectionReason: !approve ? rejectionReason : undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process verification request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reviewing verification request:', error);
    throw new Error(error.message || 'Failed to process verification request');
  }
};

