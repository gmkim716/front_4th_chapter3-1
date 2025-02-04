import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const testEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-02-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-02-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-02-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2025-02-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 회의', // 설명에 회의
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '이벤트 5',
      date: '2025-02-02',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 회의', // 설명에 회의
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(
      testEvents,
      '이벤트 2',
      new Date('2025-02-01'),
      'month'
    );
    expect(filteredEvents).toEqual([testEvents[1]]);
  });

  it('주간 뷰에서 2025-02-25 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(testEvents, '', new Date('2025-02-25'), 'week');
    expect(filteredEvents).toHaveLength(2);
  });

  it('월간 뷰에서 2025년 2월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(testEvents, '', new Date('2025-02'), 'month');
    expect(filteredEvents).toHaveLength(5);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(testEvents, '이벤트', new Date('2025-02'), 'month');
    expect(filteredEvents).toHaveLength(5);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(testEvents, '', new Date('2025-02'), 'month');
    expect(filteredEvents).toHaveLength(5);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const mixedCaseEvents: Event[] = [
      {
        id: '1',
        title: 'TEAM Meeting',
        date: '2025-02-20',
        startTime: '10:00',
        endTime: '11:00',
        description: 'Weekly team sync',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: 'team lunch',
        date: '2025-02-21',
        startTime: '12:00',
        endTime: '13:00',
        description: 'Team building',
        location: '식당',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const filteredEvents = getFilteredEvents(mixedCaseEvents, 'team', new Date('2025-02'), 'month');
    expect(filteredEvents).toHaveLength(2);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const boundaryEvents: Event[] = [
      {
        id: '1',
        title: '월말 이벤트',
        date: '2025-01-31',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '월초 이벤트',
        date: '2025-02-01',
        startTime: '00:00',
        endTime: '01:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    // 1월 필터링 테스트
    const januaryEvents = getFilteredEvents(boundaryEvents, '', new Date('2025-01'), 'month');
    expect(januaryEvents).toHaveLength(1);
    expect(januaryEvents[0].id).toBe('1');

    // 2월 필터링 테스트
    const februaryEvents = getFilteredEvents(boundaryEvents, '', new Date('2025-02'), 'month');
    expect(februaryEvents).toHaveLength(1);
    expect(februaryEvents[0].id).toBe('2');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const filteredEvents = getFilteredEvents(emptyEvents, '이벤트', new Date('2025-02'), 'month');
    expect(filteredEvents).toHaveLength(0);
    expect(Array.isArray(filteredEvents)).toBe(true);
  });
});
