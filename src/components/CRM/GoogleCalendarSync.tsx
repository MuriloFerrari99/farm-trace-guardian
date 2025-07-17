import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Loader2, Settings } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface GoogleCalendarSyncProps {
  task?: any;
  onSync?: () => void;
  showSettings?: boolean;
}

const GoogleCalendarSync = ({ task, onSync, showSettings = false }: GoogleCalendarSyncProps) => {
  const { 
    isConnected, 
    isConnecting, 
    checkConnection, 
    connectGoogleCalendar, 
    disconnectGoogleCalendar,
    syncTaskToCalendar 
  } = useGoogleCalendar();

  useEffect(() => {
    checkConnection();
  }, []);

  const handleSyncTask = async () => {
    if (!task) return;
    
    try {
      const action = task.google_calendar_event_id ? 'update' : 'create';
      await syncTaskToCalendar(task.id, task, action);
      onSync?.();
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const handleDeleteFromCalendar = async () => {
    if (!task?.google_calendar_event_id) return;
    
    try {
      await syncTaskToCalendar(task.id, task, 'delete');
      onSync?.();
    } catch (error) {
      console.error('Delete sync error:', error);
    }
  };

  if (showSettings) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Google Calendar</span>
            {isConnected && (
              <Badge variant="default" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            )}
          </div>
          
          {isConnected ? (
            <Button 
              onClick={disconnectGoogleCalendar}
              variant="outline" 
              size="sm"
            >
              Desconectar
            </Button>
          ) : (
            <Button 
              onClick={connectGoogleCalendar}
              disabled={isConnecting}
              size="sm"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Conectar
                </>
              )}
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          {isConnected 
            ? 'Suas tarefas serão sincronizadas automaticamente com o Google Calendar.'
            : 'Conecte sua conta Google para sincronizar tarefas com o Google Calendar.'
          }
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        onClick={connectGoogleCalendar}
        disabled={isConnecting}
        variant="outline" 
        size="sm"
        className="text-xs"
      >
        {isConnecting ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Calendar className="h-3 w-3 mr-1" />
        )}
        Conectar Calendar
      </Button>
    );
  }

  if (!task) {
    return (
      <Badge variant="outline" className="text-xs">
        <Check className="h-3 w-3 mr-1" />
        Calendar Conectado
      </Badge>
    );
  }

  const isSynced = task.google_calendar_event_id;

  return (
    <div className="flex items-center gap-2">
      {isSynced ? (
        <>
          <Badge variant="default" className="text-xs">
            <Check className="h-3 w-3 mr-1" />
            Sincronizado
          </Badge>
          <Button 
            onClick={handleDeleteFromCalendar}
            variant="ghost" 
            size="sm"
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
          >
            Remover
          </Button>
        </>
      ) : (
        <Button 
          onClick={handleSyncTask}
          variant="outline" 
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Sincronizar
        </Button>
      )}
    </div>
  );
};

export default GoogleCalendarSync;