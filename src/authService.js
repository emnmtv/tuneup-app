const BASE_URL = "http://localhost:3200/auth"; // Base API URL
// const BASE_URL = "http://192.168.0.104:3200/auth"; // Base API URL

// New base URL for images and videos
const MEDIA_BASE_URL = "http://localhost:3200"; // Remove /uploads from base URL
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

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
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

  if (!response.ok) throw new Error("Failed to register");
  return response.json();
}

export async function verifyEmail(email, code) {
  try {
    const response = await fetch(`${BASE_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }), // Matches the React version
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}

export const upgradeToCreator = async (data) => {
  const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

  if (!token) {
    throw new Error('Token not found. Please log in.');
  }

  const response = await fetch(`${BASE_URL}/upgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
    },
    body: JSON.stringify(data),
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

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('detailedDescription', data.detailedDescription || ''); // New field
  formData.append('amount', data.amount || ''); // New field
  formData.append('remarks', data.remarks || ''); // New field

  if (data.image) {
    formData.append('image', data.image); // File object
  }
  if (data.video) {
    formData.append('video', data.video); // File object
  }

  try {
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
      throw new Error('Failed to create post');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createPost:', error);
    throw new Error(error.message || 'Unknown error occurred');
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
      posts: data.posts.map(post => ({
        ...post,
        image: post.image ? `${MEDIA_BASE_URL}/uploads/${post.image}` : null,
        video: post.video ? `${MEDIA_BASE_URL}/uploads/${post.video}` : null,
      })),
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
    const response = await fetch(`${BASE_URL}/editpost`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: Number(postId), // Convert to integer
        ...postData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', errorData);
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Edit Post error:', error);
    return null;
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
      .map(post => ({
        ...post,
        image: post.image ? `${MEDIA_BASE_URL}/uploads/${post.image}` : null,
        video: post.video ? `${MEDIA_BASE_URL}/uploads/${post.video}` : null,
      }));

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

    // Construct full URLs for images and videos
    return {
      ...data,
      image: data.image ? `${MEDIA_BASE_URL}/uploads/${data.image}` : null,
      video: data.video ? `${MEDIA_BASE_URL}/uploads/${data.video}` : null,
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

