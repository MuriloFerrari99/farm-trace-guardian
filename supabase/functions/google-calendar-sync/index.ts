import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid user token');
    }

    const { action, taskId, taskData } = await req.json();

    // Get user's Google tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google Calendar não está conectado. Conecte primeiro nas configurações.');
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now >= expiresAt && tokenData.refresh_token) {
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        
        // Update stored token
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);
        
        await supabase
          .from('user_google_tokens')
          .update({
            access_token: accessToken,
            expires_at: newExpiresAt.toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        throw new Error('Failed to refresh Google token. Please reconnect Google Calendar.');
      }
    }

    let result;

    switch (action) {
      case 'create':
        result = await createCalendarEvent(accessToken, taskData);
        
        // Update task with Google Calendar event ID
        if (result.id) {
          await supabase
            .from('crm_tasks')
            .update({ google_calendar_event_id: result.id })
            .eq('id', taskId);
        }
        break;

      case 'update':
        if (taskData.google_calendar_event_id) {
          result = await updateCalendarEvent(accessToken, taskData.google_calendar_event_id, taskData);
        }
        break;

      case 'delete':
        if (taskData.google_calendar_event_id) {
          result = await deleteCalendarEvent(accessToken, taskData.google_calendar_event_id);
          
          // Remove Google Calendar event ID from task
          await supabase
            .from('crm_tasks')
            .update({ google_calendar_event_id: null })
            .eq('id', taskId);
        }
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        message: 'Sincronização com Google Calendar realizada com sucesso!' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

async function createCalendarEvent(accessToken: string, taskData: any) {
  const event: CalendarEvent = {
    summary: taskData.title,
    description: taskData.description || '',
    start: {
      dateTime: new Date(taskData.due_date).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: new Date(new Date(taskData.due_date).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: 'America/Sao_Paulo',
    },
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create event failed:', errorText);
    throw new Error('Failed to create calendar event');
  }

  return await response.json();
}

async function updateCalendarEvent(accessToken: string, eventId: string, taskData: any) {
  const event: CalendarEvent = {
    summary: taskData.title,
    description: taskData.description || '',
    start: {
      dateTime: new Date(taskData.due_date).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: new Date(new Date(taskData.due_date).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update event failed:', errorText);
    throw new Error('Failed to update calendar event');
  }

  return await response.json();
}

async function deleteCalendarEvent(accessToken: string, eventId: string) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    console.error('Delete event failed:', errorText);
    throw new Error('Failed to delete calendar event');
  }

  return { deleted: true };
}