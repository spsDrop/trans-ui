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
import Loader from '../loader'
import Modal from '../modal'
import axios from 'axios'

type State = {
    status?: {ssid?: string},
    ssids?: string[],
    ssid?: string,
    scanning: boolean,
    passwordPrompt: boolean
}

const SsidRow = styled(HorizontalGroup)`
    margin-right: 0;
    ${Detail} {
        margin-right: 2em;
    }
`

const WifiWrap = styled(HorizontalGroup)`
    
    @media (max-width: ${singleColumnBreak}) {
        flex-direction: column-reverse;
        align-items: stretch;
    }
`

const Input = styled(Button.withComponent('input'))``

export default class WifiView extends React.Component<{}, State> {
    constructor(props) {
        super(props)
        this.state = {
            scanning: false,
            passwordPrompt: false
        }
    }

    componentDidMount() {
        this.updateStatus().
        then(() => {
            if (!this.state?.status?.ssid) {
                this.siteScan()
            }
        })
    }

    updateStatus() {
        return fetch('/api/wifi/status').
        then(res => res.json()).
        then(data => {
            this.setState({
                status: data
            })
        })
    }

    siteScan() {
        this.setState({scanning: true})
        return fetch('/api/wifi/scan').
        then(res => res.json()).
        then(data => {
            this.setState({
                ssids: data,
                scanning: false
            })
        }).catch(() => {
            this.setState({
                scanning: false
            })
        })
    }

    promptPassword(ssid) {
        this.setState({
            ssid,
            passwordPrompt: true
        })

    }

    cancelModal() {
        this.setState({
            passwordPrompt: false
        })
    }

    ssidInput?: HTMLInputElement
    passwordInput?: HTMLInputElement

    connect() {
        const ssid = this.ssidInput.value
        const password = this.passwordInput.value
        axios.post(
            '/api/wifi/connect',
            {
                ssid,
                password
            }
        ).then(res => {
            if (res?.data.success) {
                this.cancelModal()
            } else {
                alert('Error connecting')
            }
            this.updateStatus()
        }).catch(e => {
            console.error(e)
            this.updateStatus()
            alert('Error connecting')
        })
    }

    renderSsid(ssid) {
        return (
            <SsidRow>
                <Detail>
                    {ssid} 
                </Detail>
                <Detail>
                    <GreenButton onClick={()=> this.promptPassword(ssid)}>Connect</GreenButton>
                </Detail>
            </SsidRow>
        )
    }

    render() {
        const {
            status,
            ssids,
            scanning,
            ssid,
            passwordPrompt
        } = this.state
        return (
            <ContainerBox>
                <Modal shown={passwordPrompt}>
                    <Details>
                        <Detail>Please enter SSID and password</Detail>
                        <Detail size="small">SSID</Detail>
                        <Input ref={ref => this.ssidInput = ref} type="text" defaultValue={ssid}/>
                        <Detail size="small">Password</Detail>
                        <Input ref={ref => this.passwordInput = ref} type="password"/>
                        <Detail>
                            <Button onClick={()=> this.cancelModal()}>Cancel</Button>
                            <GreenButton onClick={()=> this.connect()}>Connect</GreenButton>
                        </Detail>
                    </Details>
                </Modal>
                <WifiWrap>
                    <Details>
                        <Detail>
                            <Button
                                disabled={scanning}
                                onClick={()=>this.siteScan()}
                                css={css({marginRight: '1em !important'})}
                            >
                                Scan
                            </Button>
                            {scanning ? 'Scanning ...' : ''}
                        </Detail>
                        {!!ssids?.length && !scanning && ssids.map(ssid => this.renderSsid(ssid))}
                        {!scanning && (
                            <Detail>
                                <GreenButton onClick={()=> this.promptPassword('')}>Connect to Hidden Network</GreenButton>
                            </Detail>
                        )}
                        {scanning && (
                            <Details>
                                <Detail css={css({padding: '1em 3em'})}>
                                    <Loader css={css({margin: 'auto'})} size={6}/>
                                </Detail>
                            </Details>
                        )}
                    </Details>
                    <Details css={css({marginBottom: '2em'})}>
                        <Detail size="large">Status</Detail>
                        <Detail>
                            {
                                status?.ssid ? `Connected to ${status.ssid}` : 'Not connected'
                            }
                        </Detail>
                    </Details>
                </WifiWrap>
            </ContainerBox>
        )
    }
}