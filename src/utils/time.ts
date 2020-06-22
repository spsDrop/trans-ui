
export type Duration = {
    seconds: number
    minutes: number
    hours: number
    days: number
}

export const secondsToDuration = (uptime: number): Duration => {
    return {
        seconds: uptime % 60,
        minutes: Math.floor(uptime / 60) % 60,
        hours: Math.floor(uptime / (60 * 60)) % 24,
        days: Math.floor(uptime / (24 * 60 * 60))
    }
}