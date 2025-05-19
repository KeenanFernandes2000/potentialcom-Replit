import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UpdateProfileInput } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Register new user
  const registerMutation = useMutation({
    mutationFn: (userData: { email: string; password: string; isSubscribedToNewsletter?: boolean }) => 
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: () => {
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      // Clear user data from cache
      queryClient.resetQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: UpdateProfileInput) => 
      apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    onSuccess: () => {
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Request password reset
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => 
      apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  });

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: (resetData: { email: string; token: string; newPassword: string }) => 
      apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData),
      }),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    registerStatus: {
      isLoading: registerMutation.isPending,
      isSuccess: registerMutation.isSuccess,
      error: registerMutation.error,
    },
    loginStatus: {
      isLoading: loginMutation.isPending,
      isSuccess: loginMutation.isSuccess,
      error: loginMutation.error,
    },
    logoutStatus: {
      isLoading: logoutMutation.isPending,
    },
    updateProfileStatus: {
      isLoading: updateProfileMutation.isPending,
      isSuccess: updateProfileMutation.isSuccess,
      error: updateProfileMutation.error,
    },
  };
}