import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events: fetchedEvents } = await response.json();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      throw error;
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing && 'id' in eventData) {
        response = await fetch(`/api/events/${eventData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      
      toast({
        title: editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchEvents();
      toast({
        title: '일정 로딩 완료!',
        status: 'info',
        duration: 1000,
      });
    };
    
    init();
  }, []);

  return {
    events,
    saveEvent,
    deleteEvent,
  };
};
