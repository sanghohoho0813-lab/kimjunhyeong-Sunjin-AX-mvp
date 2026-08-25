import { ShopShell } from "@/components/shop/ShopShell";

/** 고객용 B2B Front — 외부 거래처가 보는 화면 */
export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ShopShell>{children}</ShopShell>;
}
