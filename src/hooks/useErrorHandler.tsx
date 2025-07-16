import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';

export const useErrorHandler = () => {
  const { signOut } = useAuthContext();

  const handleError = (error: any, context: string = '') => {
    console.error(`Error in ${context}:`, error);

    // Check if it's an auth error
    if (error?.message?.includes('JWT') || 
        error?.message?.includes('not authenticated') ||
        error?.code === 'PGRST301') {
      toast.error('Sessão expirada. Faça login novamente.');
      signOut();
      return;
    }

    // Check for RLS policy errors
    if (error?.message?.includes('row-level security policy') ||
        error?.code === 'PGRST116') {
      toast.error('Você não tem permissão para realizar esta ação.');
      return;
    }

    // Check for network errors
    if (error?.message?.includes('NetworkError') ||
        error?.message?.includes('fetch')) {
      toast.error('Erro de conexão. Verifique sua internet.');
      return;
    }

    // Generic error
    const errorMessage = error?.message || 'Erro desconhecido';
    toast.error(`Erro ${context ? `em ${context}` : ''}: ${errorMessage}`);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  return {
    handleError,
    handleSuccess,
  };
};