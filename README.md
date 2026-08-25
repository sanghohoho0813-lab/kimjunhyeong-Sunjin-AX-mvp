# 선진산업 Business AX

피혁 거래·재고·영업·경영 의사결정을 하나로 연결한 반응형 Business AX MVP.

- **경영 대시보드** — 실제 재무 실적(2023–2025) 기반 KPI, 재무 성과 추이, 자산 구성, AI 경영 브리핑, 오늘의 AX 추천
- **거래처/영업** — 구매 패턴 기반 재구매 가능성 지수, 상태 분류, 영업 액션 등록
- **피혁/재고** — 장기재고 탐지(시연 룰: 90일 관심 / 120일 장기재고), 판매 가능 거래처 추천
- **AX 판매처 추천** — 소재·컬러·두께·재구매 타이밍·거래 가치를 조합한 설명 가능한 매칭 점수
- **견적/주문** — 거래처 과거 단가·수량 구간·마진 가드를 반영한 추천 견적 빌더
- **경영분석** — 재무 신호, 2024→2025 핵심 변화, 재무 시나리오 Simulation
- **모바일 최적화** — Bottom Navigation, 카드형 UI, Safe Area, 글자 크기 설정

> 기획·구축: **미래에이아이랩 x 김준형**

## 실행

```bash
npm install
npm run dev
```

- **Demo Mode (기본)** — 환경변수 없이 모든 기능이 로컬 시연 데이터로 동작합니다.
- **Supabase Mode (선택)** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 시 Supabase 데이터 레이어를 사용할 수 있습니다. 스키마는 `supabase/schema.sql` 참고.

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Recharts · Framer Motion · Zustand · Lucide

## 구조

```
app/                # 대시보드·거래처·재고·견적·AX 추천·경영분석·설정
components/         # layout / dashboard / charts / inventory / shared
lib/
  data/             # 중앙 시드 데이터 + 파생 값 계산 (수치 일관성 보장)
  scoring/          # 재구매 가능성·판매처 매칭 점수
  pricing/          # 추천 단가·마진 계산
  insights/         # AI 경영 브리핑·AX 추천·알림 (규칙 기반)
  ai/               # LLM Provider 교체용 인터페이스
```

개별 거래처·재고·견적 데이터는 시연용 샘플이며, 재무 실적은 제공된 실제 자료를 사용합니다.
