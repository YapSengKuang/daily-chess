"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function AuthControls() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <span className="muted">Checking sign-in…</span>;
  }

  if (!session?.user) {
    return (
      <button
        className="btn"
        type="button"
        onClick={() => signIn("google", { callbackUrl: pathname || "/" })}
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="account">
      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={session.user.image} alt="" className="avatar" referrerPolicy="no-referrer" />
      ) : null}
      <span className="account-name">{session.user.name ?? session.user.email}</span>
      <button className="btn btn-ghost" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </button>
    </div>
  );
}
