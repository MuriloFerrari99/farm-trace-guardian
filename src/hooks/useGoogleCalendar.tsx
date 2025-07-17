import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoogleCalendar = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('id, expires_at')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setIsConnected(false);
        return false;
      }

      // Check if token is not expired
      const isValid = new Date(data.expires_at) > new Date();
      setIsConnected(isValid);
      return isValid;
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      setIsConnected(false);
      return false;
    }
  };

  const connectGoogleCalendar = () => {
    setIsConnecting(true);
    
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // This should come from environment
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open popup window for Google OAuth
    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
    
    // Listen for popup messages
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup?.close();
        setIsConnecting(false);
        setIsConnected(true);
        toast({
          title: "Sucesso",
          description: "Google Calendar conectado com sucesso!",
        });
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        popup?.close();
        setIsConnecting(false);
        toast({
          title: "Erro",
          description: "Erro ao conectar Google Calendar: " + event.data.error,
          variant: "destructive",
        });
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        setIsConnecting(false);
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  const disconnectGoogleCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIsConnected(false);
      toast({
        title: "Sucesso",
        description: "Google Calendar desconectado com sucesso!",
      });
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: "Erro",
        description: "Erro ao desconectar Google Calendar",
        variant: "destructive",
      });
    }
  };

  const syncTaskToCalendar = async (taskId: string, taskData: any, action: 'create' | 'update' | 'delete') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action,
          taskId,
          taskData,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error syncing task to calendar:', error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar com Google Calendar: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    isConnected,
    isConnecting,
    checkConnection,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncTaskToCalendar,
  };
};