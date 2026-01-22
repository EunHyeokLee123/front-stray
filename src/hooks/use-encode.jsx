const enc = new TextEncoder();
const dec = new TextDecoder();
const algorithm = {
  name: "AES-GCM",
  length: 256,
};

const ivLength = 12; // GCM 권장값

const base64ToArrayBuffer = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const arrayBufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const getKey = async (secret) => {
  const keyData = enc.encode(secret.padEnd(32, "0").slice(0, 32)); // 32바이트 고정
  return crypto.subtle.importKey("raw", keyData, algorithm, false, [
    "encrypt",
    "decrypt",
  ]);
};

export async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const key = await getKey(import.meta.env.VITE_SECRET_KEY);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return JSON.stringify({
    content: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  });
}

export async function decrypt(encryptedString) {
  const encrypted = JSON.parse(encryptedString);
  const key = await getKey(import.meta.env.VITE_SECRET_KEY);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToArrayBuffer(encrypted.iv),
    },
    key,
    base64ToArrayBuffer(encrypted.content)
  );

  return dec.decode(decrypted);
}
