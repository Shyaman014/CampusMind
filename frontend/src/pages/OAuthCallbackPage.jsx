import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Authenticating with social provider...');

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get('token');
      const err = searchParams.get('error');

      if (err) {
        setError(`Social authentication failed: ${err}. Please try logging in again.`);
        return;
      }

      if (token) {
        try {
          setStatus('Verifying account details...');
          await loginWithToken(token);
          setStatus('Authentication successful! Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } catch (e) {
          setError('Failed to verify social login token. Please sign in again.');
        }
      } else {
        setError('No authentication token received from provider.');
      }
    };

    processOAuth();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-transparent">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#111111] border border-[#2A2A2A] text-center space-y-6 shadow-sm">
        <div className="flex justify-center">
          <BrandLogo size={56} iconSize={34} />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Authentication Error</h3>
            <p className="text-sm text-red-400 font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              {error}
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-2.5 px-4 rounded-xl text-[14px] font-medium bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] smooth-transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Connecting Account</h3>
            <p className="text-sm text-[#A1A1AA]">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
