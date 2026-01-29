export function serverFetch(path: string) {
    const base =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL

    // // .log('first', `${base}${path}`)
  
    return fetch(`${base}${path}`, {
      cache: "no-store",
    });
  }
  