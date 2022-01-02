export async function generateSignedUrl(url) {
  // We"ll need some super-secret data to use as a symmetric key.
  const encoder = new TextEncoder()
  const secretKeyData = encoder.encode("KomischesTeil91")
  const key = await crypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  // Signed requests expire after one minute. Note that you could choose
  // expiration durations dynamically, depending on, e.g. the path or a query
  // parameter.
  const expirationMs = 15000
  const expiry = Date.now() + expirationMs
  const dataToAuthenticate = url.pathname + expiry

  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(dataToAuthenticate))

  // `mac` is an ArrayBuffer, so we need to jump through a couple of hoops to get
  // it into a ByteString, and then a Base64-encoded string.
  const base64Mac = btoa(String.fromCharCode(...new Uint8Array(mac)))

  url.searchParams.set("mac", base64Mac)
  url.searchParams.set("expiry", expiry)

  return new Response(url)
}

addEventListener("fetch", event => {
  const url = new URL(event.request.url)
  const prefix = "/request"
  if (url.pathname.startsWith(prefix)) {
    // Replace the "/generate/" path prefix with "/verify/", which we
    // use in the first example to recognize authenticated paths.
    url.pathname = `/form/${url.pathname.slice(prefix.length)}`
    event.respondWith(generateSignedUrl(url))
  } else {
    event.respondWith(fetch(event.request))
  }
})
