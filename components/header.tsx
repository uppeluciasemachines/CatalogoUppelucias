
import Image from "next/image";
import Link from "next/link";
import CartSidebar from "./cart-sidebar";

const menuItems = [
  { label: "Pelúcias", href: "#" },
  { label: "Novidades", href: "#" },
  { label: "Promoções", href: "#" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border w-screenitems-center flex flex-row justify-center">
      <div className="w-7xl ">
        <div className="flex items-center justify-between h-16 md:h-14">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo-up.png"
              width={100}
              height={63}
              priority
              alt="Logo Up"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <CartSidebar />
        </div>
      </div>
    </header>
  );
}
