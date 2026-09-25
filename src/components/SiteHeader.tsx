import Link from "next/link";
import { Countdown } from "./Countdown";
import { SiteMenu } from "./SiteMenu";

export function SiteHeader() {
  return (
    <header className="top">
      <div>
        <p className="brand">
          <Link href="/">Daily Chess</Link>
        </p>
        <Countdown />
      </div>
      <SiteMenu />
    </header>
  );
}
