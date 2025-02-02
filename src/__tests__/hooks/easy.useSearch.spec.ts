import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const testEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의', // 제목에 회의
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
    title: '점심 약속',
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
    title: '프로젝트 마감',
    date: '2025-02-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '회의실', // location에 회의
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: '프로젝트 마감',
    date: '2025-02-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 회의', // 설명에 회의
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

// Q. useSearch를 따로 빼는게 좋을까?

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch([], new Date(), 'week'));

  expect(result.current.filteredEvents).toEqual([]);
});

// Q. 이렇게 임의의 객체를 생성해서 테스트 검증하는게 안전한 방법인건가?
// A. 딱 act 보고, 딱 toEqual이나 toBe보고 딱 파악할 수 있도록 하자
it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const testDate = new Date('2025-02-01');
  const view = 'month';

  const { result } = renderHook(() => useSearch(testEvents, testDate, view));

  // '점'로 검색했을 때, '점심'가 포함된 이벤트만 필터링되어야 함
  act(() => {
    result.current.setSearchTerm('점');
  });

  // 방식1: 단일검증 - 피하도록 합시다
  // expect(result.current.filteredEvents).toEqual([testEvents[1]]);

  // 방식2: 구체적인 속성을 검증 - 파악하기 더 좋다
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const testDate = new Date('2025-02-02');
  const view = 'month';

  const { result } = renderHook(() => useSearch(testEvents, testDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(3);
});

it('현재 뷰(주간/월간)에 회의가 있는 날짜만 반환해야 한다', () => {
  const testDate = new Date('2025-02-20');

  // week
  const { result: weekResult } = renderHook(() => useSearch(testEvents, testDate, 'week'));

  act(() => {
    weekResult.current.setSearchTerm('팀 회의');
  });

  expect(weekResult.current.filteredEvents).toHaveLength(1);
  expect(weekResult.current.filteredEvents[0].date).toBe('2025-02-20');

  // month
  const { result: monthResult } = renderHook(() => useSearch(testEvents, testDate, 'month'));

  act(() => {
    monthResult.current.setSearchTerm('팀 회의');
  });

  expect(monthResult.current.filteredEvents).toHaveLength(1);
  expect(monthResult.current.filteredEvents[0].date).toBe('2025-02-20');
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const testDate = new Date('2025-02-20');

  const { result } = renderHook(() => useSearch(testEvents, testDate, 'month'));

  act(() => {
    result.current.setSearchTerm('점심 약속');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});
