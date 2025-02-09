import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

const initialEvents: Event[] = [
  {
    id: '1',
    title: '미팅',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('useEventOperations', () => {
  beforeEach(() => {
    toastFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });

    expect(toastFn).toHaveBeenCalledWith({
      // toHaveBeenCalledWith: jest의 mock함수 테스트를 위한 matcher
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const newEvent: EventForm = {
      title: '산책하기',
      date: '2025-05-24',
      startTime: '15:00',
      endTime: '18:00',
      description: '산책',
      location: '공원',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const resultEvents = setupMockHandlerCreation(initialEvents);

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });

    act(() => {
      result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toEqual(resultEvents);
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const updatedEvent: Event = {
      ...initialEvents[0],
      title: '업데이트된 이벤트',
      endTime: '12:00',
    };

    const resultEvents = setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(true));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toEqual(resultEvents);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const resultEvents = setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });

    act(() => {
      result.current.deleteEvent(initialEvents[0].id);
    });

    await waitFor(() => {
      expect(result.current.events).toEqual(resultEvents);
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ message: '이벤트 로딩 실패' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual([]);
      expect(toastFn).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await result.current.saveEvent(initialEvents[0]);

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await result.current.deleteEvent(initialEvents[0].id);

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });
});
