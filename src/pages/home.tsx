import * as React from 'react'
import styled from "@emotion/styled"
import { secondsToTimeString } from "../utils/time";
import type { Duration } from "../utils/time";
import type { AppStatus } from '../app'
import {singleColumnBreak, HorizontalGroup} from '../commonStyledComponents'

type Props = {
    status: AppStatus
}

const HomeWrapper = styled(HorizontalGroup)`
    justify-content: space-between;
    align-items: center;
    @media (max-width: ${singleColumnBreak}) {
        flex-direction: column;
        align-items: stretch;
    }
`
const SpalshPanel = styled.div`
    color: white;
    padding: 6rem 0;
`
const SpalshTitle = styled.h1`
    font-size: 4rem;
    margin-bottom: 3rem;
`
const SpalshSubtitle = styled.p`
    font-size: 2rem;
`
const SplashStatus = styled.div`
    background: white;
    color: #555;
    font-size: 1.5 rem;
    padding: 1.5rem 1.8rem;
    border-radius: .7rem;
    min-width: 18rem;
`
const SplashStatusLine = styled.div`
    font-weight: bold;
    font-size: 1.5rem;
    margin-bottom: 1rem;
`



export default class Home extends React.Component<Props>{
    render() {
        const { uptime = 0} = this.props.status

        return (
            <HomeWrapper>
                <SpalshPanel>
                    <SpalshTitle>
                        Together, <br/> We make the future
                    </SpalshTitle>
                    <SpalshSubtitle>
                        Let's make your <br/> dream come true
                    </SpalshSubtitle>
                </SpalshPanel>
                <SplashStatus>
                    <SplashStatusLine>Transform Status</SplashStatusLine>
                    {(this.props.status.cpuLoad > -1 && <SplashStatusLine>CPU Usage: {this.props.status.cpuLoad}%</SplashStatusLine>)}
                    {(this.props.status.cpuTemp && <SplashStatusLine>CPU Temp: {this.props.status.cpuTemp}°c</SplashStatusLine>)}
                    {(this.props.status.diskUsage && <SplashStatusLine>Disk Usage: {this.props.status.diskUsage}%</SplashStatusLine>)}
                    {(this.props.status.uptime && <SplashStatusLine>Uptime: {secondsToTimeString(uptime)}</SplashStatusLine>)}
                </SplashStatus>
            </HomeWrapper>
        )
    }
}