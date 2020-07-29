import { ResinProfile } from "../pages/profiles"


export type Duration = {
    seconds: number
    minutes: number
    hours: number
    days: number
}

export const secondsToDuration = (timeInSeconds: number): Duration => {
    return {
        seconds: timeInSeconds % 60,
        minutes: Math.floor(timeInSeconds / 60) % 60,
        hours: Math.floor(timeInSeconds / (60 * 60)) % 24,
        days: Math.floor(timeInSeconds / (24 * 60 * 60))
    }
}

export const secondsToTimeString = (timeInSeconds: number) => {
    const {days, hours, minutes}:Duration = secondsToDuration(timeInSeconds)
    return `${days > 0 ? ` ${days}d` : ''}${hours > 0 ? ` ${hours}h` : ''}${minutes > 0 ? ` ${minutes}m` : ''}`
}

const fixedLayerDuration = 3.7 * 1000
const printInitializationDuration = 1.33 * 60 * 1000

export const calculatePrintTime = (resin: ResinProfile, numLayers: number) => {
    const {
        burnCure,
        burnLayer,
        burn_pull_speed: burnLiftSpeed,
        burn_pull_z: burnHeight,
        led_delay: ledDelay,
        normalCure,
        pull_speed: liftSpeed,
        pull_z: height,
        push_speed: downSpeed
    } = resin

    const speedToTime = (speed, height) => (height / (speed / 60))  * 1000

    const burnLiftDuration = speedToTime(burnLiftSpeed, burnHeight)
    const burnDownDuration = speedToTime(downSpeed, burnHeight)
    const liftDuration = speedToTime(liftSpeed, height)
    const downDuration = speedToTime(downSpeed, height)

    let duration = 0;

    duration += burnLayer * (burnLiftDuration + burnDownDuration + burnCure + ledDelay + fixedLayerDuration)
    duration += (numLayers - burnLayer) * (liftDuration + downDuration + normalCure + ledDelay + fixedLayerDuration)

    return (duration + printInitializationDuration) / 1000
}