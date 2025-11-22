const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export async function apiGet(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store" 
  });

  if (!res.ok) {
    throw new Error(`API GET ${path} failed with status ${res.status}`);
  }

  return res.json();
}
