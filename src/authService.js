const BASE_URL = "http://localhost:3200/auth"; // Base API URL

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

    // Store the token and role in localStorage
    const { token, role } = result; // Assuming the response has 'token' and 'role'
    localStorage.setItem("jwtToken", token); // Store the token
    localStorage.setItem("userRole", role); // Store the role

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

  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function updateProfile(profileData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
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
    return data;
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
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error; // Propagate the error to be handled in the component
  }
};

export const fetchPostDetails = async (postId) => {
  try {
    const response = await fetch(`${BASE_URL}/viewpost?postId=${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post details');
    }
    const data = await response.json();
    return data;
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

export const initiatePayment = async (amount, description, remarks) => {
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
    body: JSON.stringify({ amount: amountInCents, description, remarks }),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to initiate payment');
  }

  return await response.json();
};

