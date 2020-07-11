/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import styled from "@emotion/styled"
import { AppStatus, getPath } from '../app'
import { secondsToTimeString, calculatePrintTime } from "../utils/time";
import {
    Detail,
    Details,
    HorizontalGroup,
    ContainerBox,
    Button,
    RedButton,
    GreenButton,
    singleColumnBreak,
    getButtonColors
} from '../commonStyledComponents'
import axios from 'axios'

export default class ToolsView extends React.Component {
    shutdown() {
        axios.post('/api/system/shutdown')
    }

    reboot() {
        axios.post('/api/system/reboot')
    }

    render() {
        return (
            <div>
                <Detail size="large">Tools</Detail>
                <Detail>
                    <RedButton onClick={()=> this.shutdown()}>Shutdown Printer</RedButton>
                </Detail>
                <Detail>
                    <RedButton onClick={()=> this.reboot()}>Reboot Printer</RedButton>
                </Detail>
            </div>
        )
    }
}