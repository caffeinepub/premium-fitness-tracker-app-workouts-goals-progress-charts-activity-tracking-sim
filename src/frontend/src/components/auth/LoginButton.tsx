import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, LogIn } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-accent/50 text-sm font-medium"
    >
      {isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          <span>{disabled ? 'Signing In...' : 'Sign In'}</span>
        </>
      )}
    </button>
  );
}
