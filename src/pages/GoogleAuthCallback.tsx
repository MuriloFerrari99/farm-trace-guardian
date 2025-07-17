import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        window.opener?.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', error },
          window.location.origin
        );
        window.close();
        return;
      }
      
      if (code) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            throw new Error('User not authenticated');
          }

          const { data, error } = await supabase.functions.invoke('google-oauth', {
            body: {
              code,
              redirect_uri: `${window.location.origin}/auth/google/callback`,
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) throw error;

          window.opener?.postMessage(
            { type: 'GOOGLE_AUTH_SUCCESS', data },
            window.location.origin
          );
        } catch (error) {
          console.error('Google OAuth error:', error);
          window.opener?.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error: error.message },
            window.location.origin
          );
        }
      }
      
      window.close();
    };
    
    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Conectando com Google Calendar...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;