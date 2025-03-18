import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    // useCalendarView 훅 호출
    const { result } = renderHook(() => useCalendarView());
    
    // 기본 값이 month로 세팅되어 있는지 확인
    expect(result.current.view).toBe('month');
  });
  
  it('currentDate는 오늘 날짜인 "2024-10-01"이어야 한다', () => {
    // useCalendarView 훅 호출
    const { result } = renderHook(() => useCalendarView());
    
    // currentDate가 2024-10-01로 세팅되어 있는지 확인, useCalenderView에 초깃값으로 2024-10-01이 세팅되어 있음
    assertDate(result.current.currentDate, new Date('2024-10-01'));
  });
  
  it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
    // useCalendarView 훅 호출
    const { result } = renderHook(() => useCalendarView());
    
    // fetchHolidays를 통해 입력된 데이터 확인
    expect(result.current.holidays).toEqual({
      '2024-10-03': '개천절',
      '2024-10-09': '한글날',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  // 테스트할 훅을 호출
  const { result } = renderHook(() => useCalendarView());
  
  // view를 week로 업데이트
  act(() => {
    result.current.setView('week');
  });
  
  // 업데이트가 적용되었는지 확인
  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2024-10-08' 날짜로 지정이 된다", () => {
  // 테스트 훅 호출
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  
  // useCalendarView 훅에 정의된 navigate 메서드 동작
  act(() => {
    result.current.navigate('next');
  });
  
  assertDate(result.current.currentDate, new Date('2024-10-08'));
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2024-09-24' 날짜로 지정이 된다", () => {
  // 테스트 훅 호출
  const { result } = renderHook(() => useCalendarView());
  // week로 설정
  act(() => {
    result.current.setView('week');
  });
  
  // navigate(prev) 동작
  act(() => {
    result.current.navigate('prev');
  });
  
  // 결과 비교
  assertDate(result.current.currentDate, new Date('2024-09-24'));
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2024-11-01' 날짜여야 한다", () => {
  // 테스트 훅 호출
  const { result } = renderHook(() => useCalendarView());
  
  // navigate(next) 동작
  act(() => {
    result.current.navigate('next');
  });
  
  // 결과 확인
  assertDate(result.current.currentDate, new Date('2024-11-01'));
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2024-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  
  act(() => {
    result.current.navigate('prev');
  });
  
  assertDate(result.current.currentDate, new Date('2024-09-01'));
});

it("currentDate가 '2024-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());
  
  act(() => {
    result.current.setCurrentDate(new Date('2024-01-01'));
  });
  
  expect(result.current.holidays).toEqual({ '2024-01-01': '신정' });
});