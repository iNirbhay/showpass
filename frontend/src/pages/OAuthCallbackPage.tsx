import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Film } from 'lucide-react';
import { AuthService } from '../services/auth.service';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  useEffect(() => {
    const processOAuth = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        localStorage.setItem('showpass_access_token', accessToken);
        localStorage.setItem('showpass_refresh_token', refreshToken);

        try {
          const profile = await AuthService.getMe();
          setAuthSession(accessToken, refreshToken, profile.user);
          navigate('/', { replace: true });
        } catch (err) {
          console.error('OAuth profile retrieval failed:', err);
          navigate('/login?error=oauth_profile_failed', { replace: true });
        }
      } else {
        navigate('/login?error=oauth_missing_tokens', { replace: true });
      }
    };

    processOAuth();
  }, [searchParams, navigate, setAuthSession]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center shadow-golden-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#FACC15]" />
      </div>
      <p className="text-xs text-[#9ba1b0] font-mono tracking-wide">Finalizing Google Authentication handshake...</p>
    </div>
  );
};
