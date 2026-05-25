// lib/hash.ts

export async function sha256(value: string) {
  const msgUint8 = new TextEncoder().encode(
    value.trim().toLowerCase()
  );

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    msgUint8
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}