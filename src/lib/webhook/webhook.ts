export default async function sendWebhook(payload: string, url: string): Promise<void> {
    if (!url) {
        console.error('Webhook error: URL is required')
        return
    }

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            const errorBody = await response.text()
            console.error('Webhook error:', `HTTP ${response.status}: ${response.statusText}`, errorBody)
        } else {
            console.log('Webhook sent successfully:', url)
        }
    } catch (error) {
        console.error('Webhook error:', error)
    }
}
