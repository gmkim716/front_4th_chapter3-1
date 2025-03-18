# front_3rd_chapter3-1

## Basic

- it: test 단위
- act: RTL에서 상태 업데이트와 관련된 작업을 수행
- expect: 테스트에서 특정 조건이 충족되는지 확인

- renderHook: RTL의 기능으로 훅을 테스트하기 위한 유틸리티
  
  - 인자로 콜백함수를 받고, 테스트하려는 훅을 호출
  - `const { result } = renderHook(() => useCalendarView())`
  - renderHook의 result는 훅의 반환값을 담는다. result.current를 통해 훅의 현재 상태와 함수에 접근할 수 있다
  - result / rerender / unmount 등의 메서드가 있다 
