import { ShieldAlert } from "lucide-react";

export default function ProductSplash() {
  return (
    <div className="product-splash fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#07080c] text-white">
      <div className="product-splash-glow product-splash-glow-one" />
      <div className="product-splash-glow product-splash-glow-two" />

      <div className="relative flex flex-col items-center">
        <div className="product-splash-mark">
          <div className="product-splash-ring product-splash-ring-one" />
          <div className="product-splash-ring product-splash-ring-two" />
          <div className="product-splash-icon">
            <ShieldAlert size={30} strokeWidth={1.8} />
          </div>
        </div>

        <div className="mt-7 overflow-hidden text-center">
          <div className="product-splash-title">Emergency AI Coordinator</div>
          <div className="product-splash-subtitle">Multi-agency emergency response</div>
        </div>

        <div className="product-splash-progress mt-8">
          <span />
        </div>
      </div>
    </div>
  );
}
