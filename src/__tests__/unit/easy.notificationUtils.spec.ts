import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-02-03',
    startTime: '15:00',
    endTime: '16:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30, // 30분 전 알림
  };

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-02-03T14:30:00'); // 이벤트 시작 30분 전
    const events = [baseEvent];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-02-03T14:30:00'); // 이벤트 시작 30분 전
    const events = [baseEvent];
    const notifiedEvents = ['1']; // 이미 알림이 간 이벤트

    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-03T14:00:00'); // 이벤트 시작 1시간 전
    const events = [baseEvent];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-03T14:45:00'); // 이벤트 시작 15분 전
    const events = [
      {
        ...baseEvent,
        notificationTime: 30, // 30분 전 알림
      },
    ];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(1);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2025-02-03',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('30분 후 팀 미팅 일정이 시작됩니다.');
  });
});
