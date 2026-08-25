import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-4xl font-extrabold text-ink-300">404</p>
      <p className="text-base font-bold text-ink-800">
        페이지를 찾을 수 없습니다.
      </p>
      <p className="text-sm text-ink-400">
        주소가 변경되었거나 삭제된 페이지일 수 있습니다.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 flex h-11 items-center rounded-btn bg-brand-600 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
      >
        대시보드로 이동
      </Link>
    </div>
  );
}
