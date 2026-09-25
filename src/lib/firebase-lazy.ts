import type * as FirebaseModule from "./firebase";

let loading: Promise<typeof FirebaseModule> | null = null;

export function loadFirebase() {
  if (!loading) loading = import("./firebase");
  return loading;
}
