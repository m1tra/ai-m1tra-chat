type Message = {
    role: "user" | "assistant"
    content: {
      type: "text" | "image_url"
      text?: string
      image_url?: {
        url: string
      }
    }[]
  }
  
  export async function fetchImageDescription(message: Message) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://educational-platform-by-m1tra.vercel.app",
        "X-Title": "ImageInspector",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-3b-instruct:free",
        messages: [message],
      }),
    })
  
    if (!res.ok) {
      const errorText = await res.text()
      console.error("Fetch failed:", res.status, errorText)
      throw new Error("Failed to fetch image description")
    }
  
    return res.json()
  }
  
  