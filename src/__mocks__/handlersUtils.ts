import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.post('/api/events', async ({ request }) => {
      const newEvent = await request.json() as Event;
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);
      return HttpResponse.json({ events: mockEvents });
    })
  );

  return mockEvents;
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '업데이트된 이벤트',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '12:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    }
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.put('/api/events/:id', async ({ request }) => {
      const updatedEvent = await request.json() as Event;
      const index = mockEvents.findIndex(event => event.id === updatedEvent.id);
      if (index !== -1) {
        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      }
      return HttpResponse.json({ events: mockEvents });
    })
  );

  return mockEvents;
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 204 });
    })
  );

  return mockEvents;
};
