function normalizePayload(payload: string): string {
    try {
        return JSON.stringify(JSON.parse(payload))
    } catch {
        // Template contains escaped quotes (e.g. from CI env vars), try to recover
        const unescaped = payload.replace(/\\"/g, '"').replace(/\\n/g, '\n')
        try {
            return JSON.stringify(JSON.parse(unescaped))
        } catch {
            return payload
        }
    }
}

export default async function sendWebhook(payload: string, url: string): Promise<void> {
    if (!url) {
        console.error('Webhook error: URL is required')
        return
    }

    const body = normalizePayload(payload)

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        const resBody = await response.text()

        if (!response.ok) {
            console.error('Webhook error:', `HTTP ${response.status}: ${response.statusText}`, resBody)
            return
        }

        try {
            const result = JSON.parse(resBody)
            if (result.errcode !== undefined && result.errcode !== 0) {
                console.error('Webhook API error:', result)
                return
            }
        } catch {
            // response is not JSON, ignore
        }

        console.log('Webhook sent successfully:', url, resBody)
    } catch (error) {
        console.error('Webhook error:', error)
    }
}
