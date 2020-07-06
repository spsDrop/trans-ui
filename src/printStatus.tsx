/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import styled from "@emotion/styled"
import { AppStatus } from './app'
import Loader from './loader'
import { Detail, Details, HorizontalGroup, ContainerBox, PreviewWrap, Preview, PreviewDetail, Button, RedButton, GreenButton, singleColumnBreak } from './commonStyledComponents'
import { secondsToTimeString } from "./utils/time";


const handleResponse = (url: string, successMessage: string) => {
    return (e: React.MouseEvent<HTMLButtonElement>, updateStatus: ()=> void) => {
        const target = e?.target as HTMLButtonElement || {disabled: false};
        target.disabled = true;
        fetch(url).
            then(res => res.json()).
            then(data => {
                if (data.success) {
                    console.log(successMessage)
                } else {
                    console.error(data.message)
                }
                target.disabled = false;
            }).
            catch(error => {
                target.disabled = false;
                console.error(error)
            })
    }
}

const pausePrint = handleResponse('/api/print/pause', 'Print paused')

const stopCommand = handleResponse('/api/print/stop', 'Print stopped')
const stopPrint = (e, updateStatus)=> {
    const stop = confirm('Do you really want to stop this print? Prints cannot be resumed once they have been stopped.')
    if (stop) {
        stopCommand(e, updateStatus)
    }
}

const resumePrint = handleResponse('/api/print/resume', 'Print resumed')

const StatusWrapper = styled(HorizontalGroup)`
    justify-content: stretch;
    @media (max-width: ${singleColumnBreak}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const PrintStatus: React.SFC<{status: AppStatus, updateStatus: ()=> void}> = ({
    status: {
        cpuTemp,
        cpuLoad,
        printInitializing,
        printStatus: {
            LAYER: currentLayer = 1,
            LAYER_TOT: totalLayers,
            PLATE_ID: plateId,
            PLATE_NAME: plateName,
            RESSIN_NAME: resinName,
            REMAIN: secondsRemaining,
            ISPAUSE: isPaused,
        }
    },
    updateStatus
}) => (
    <StatusWrapper>
        <Details hidden={printInitializing}  css={{paddingRight: "1.5rem"}}>
            <Detail>
                <Detail size="large">Printing {plateName}</Detail>
                <Detail>Layer: {currentLayer} of {totalLayers}</Detail>
                <Detail>Time Remaining: {secondsToTimeString(secondsRemaining)}</Detail>
                <Detail>Resin Profile: {resinName}</Detail>
                <Detail>CPU Usage: {cpuLoad}%</Detail>
                <Detail>CPU Temp: {cpuTemp}</Detail>
            </Detail>
            <Detail>
                <Button hidden={isPaused} onClick={e => pausePrint(e, updateStatus)}>Pause Print</Button>
                <RedButton hidden={isPaused} onClick={e => stopPrint(e, updateStatus)}>Stop Print</RedButton>
                <GreenButton hidden={!isPaused} onClick={e => resumePrint(e, updateStatus)}>Resume Print</GreenButton>
            </Detail>
        </Details>
        <Details hidden={printInitializing} css={css({minWidth: '35rem'})}>
            <PreviewWrap
                previewUrl={`/plates/${plateId}/${currentLayer}.png`}
            >
            </PreviewWrap>
        </Details>
        <HorizontalGroup>
            <Details hidden={!printInitializing} css={{paddingRight: "1.5rem"}}>
                <Detail size="large">Print Initializing</Detail>
                <Detail size="small">Printer must reach the home position before printing begins</Detail>
                <Detail>CPU Usage: {cpuLoad}%</Detail>
                <Detail>CPU Temp: {cpuTemp}</Detail>
            </Details>
            <Details hidden={!printInitializing}>
                <Loader size={5}/>
            </Details>
        </HorizontalGroup>
    </StatusWrapper>
)

export default PrintStatus