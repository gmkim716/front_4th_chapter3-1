import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  // 에러를 처리할 때는 함수로 감싸줘야 합니다
  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31);
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-02-12'); // 수요일
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(15);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-02-10'); // 월요일
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(15);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2025-02-09'); // 일요일
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(15);
  });

  // Q. 이렇게 하는걸 바라는걸까?
  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-30');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[6].getDate()).toBe(4);
    expect(weekDates[6].getFullYear()).toBe(2025);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[6].getDate()).toBe(4);
    expect(weekDates[0].getFullYear()).toBe(2024);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(25);
    expect(weekDates[6].getDate()).toBe(2);
    expect(weekDates[6].getFullYear()).toBe(2024);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2025-01-31');
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getMonth()).toBe(0); // getMonth는 0부터 시작, 0이 1월에 해당
    expect(weekDates[6].getMonth()).toBe(1);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date('2024-07-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  // 테스트용 데이터
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

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(testEvents, 25);
    expect(events).toHaveLength(2);
    expect(events).toEqual([testEvents[2], testEvents[3]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(testEvents, 26);
    expect(events).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(testEvents, 0);
    expect(events).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(testEvents, 32);
    expect(events).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2024-07-10'));
    expect(weekDates).toBe('2024년 7월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2024-07-01'));
    expect(weekDates).toBe('2024년 7월 1주');
  });

  // Q. 이런 테스트가 의미가 있는건가요?
  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2024-07-31'));
    expect(weekDates).toBe('2024년 8월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2024-12-31'));
    expect(weekDates).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2024-02-28'));
    expect(weekDates).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const weekDates = formatWeek(new Date('2025-02-28'));
    expect(weekDates).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const result = formatMonth(new Date('2024-07-10'));
    expect(result).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2024-07-10'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2024-07-01'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2024-07-31'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2024-06-30'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2024-08-01'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2024-05-31'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });
});

// fillZero: 숫자를 지정된 자릿수만큼의 문자열로 반환하는 함수
// 기본값이 2자리, 2자리보다 큰 경우 그대로 반환
describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123, 2)).toBe('123');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-02-02T00:00:00Z'));
    expect(formatted).toBe('2025-02-02');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-02-24'), 10);
    expect(formatted).toBe('2025-02-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-2-24'), 10);
    expect(formatted).toBe('2025-02-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formatted = formatDate(new Date('2025-02-1'), 1);
    expect(formatted).toBe('2025-02-01');
  });
});
