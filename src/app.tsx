import * as React from 'react'
import styled from "@emotion/styled";
import Nav from "./nav";
import Home from './pages/home'
import Plates from './pages/plates'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Modal from './modal'
import {Details, Detail, Button, ContainerBox} from './commonStyledComponents'

import type {NavSection} from './nav'

const AppWrapper = styled.div`
    min-height: 100vh;
    background: top right no-repeat url('/assets/images/demo/home/home-banner.jpg') #0D031A;
    background-size: 175% auto;
    padding: 5rem 5rem;
`
const ClearPageWrapper = styled.div`
`

const PageWrapper = styled(ClearPageWrapper)`
    padding: 3rem;
    background-color: rgba(64, 64, 64, 0.8);
    border-radius: 0.5rem;
`


const sections:Array<NavSection> = [
    {
        name: 'PLATES',
        page: 'plates'
    },
    {
        name: 'PROFILES',
        page: 'profiles'
    },
    {
        name: 'WIFI',
        page: 'wifi'
    },
    {
        name: 'TOOLS',
        page: 'tools'
    }
]

const appRoot = "/transui"

const getPath = (path: string) => {
    return [appRoot, path].join('/')
}

export type AppStatus = {
    cpuLoad?: number,
    diskUsage?: number,
    cpuTemp?: number,
    uptime?: number,
    printStatus?: object,
    version?: string,
    language?: string,
    processingUpload?: boolean,
    processingStatus?: string
}

type State = {
    status: AppStatus
}

export default class TransUIApp extends React.Component<{}, State> {
    constructor(props) {
        super(props)
        this.state = {
            status: {}
        }
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.endStatusPolling()
            } else {
                this.startStatusPolling()
            }
        }, false);
        this.startStatusPolling();
    }

    startStatusPolling() {
        this.updateStatus();
        this.pollStatus();
    }

    endStatusPolling() {
        if (this.statusTimer) {
            clearTimeout(this.statusTimer)
        }
    }

    statusTimer

    pollingInterval = 2000

    pollStatus() {
        this.statusTimer = setTimeout(() => {
            this.updateStatus()
            this.pollStatus()
        }, this.pollingInterval)
    }

    updateStatus() {
        fetch('/api/status').
            then(res => res.json()).
            then(data => {
                console.log('processingUpload:'+data.processingUpload)
                this.setState({
                    status: data
                })
            })
    }

    renderModal() {
        const {
            processingUpload,
            processingStatus
        } = this.state.status
        if (processingUpload) {
            return (
                <Modal shown={true}>
                    <Detail size="large">Processing Upload</Detail>
                    <Detail size="small">Please wait while the upload is processed. This can take a few minutes.</Detail>
                    <Detail size="small"><strong>Do not refresh the page</strong>.</Detail>
                    <Detail>Current Status: {processingStatus}</Detail>
                </Modal>
            )
        }
    }

    render(){
        return (
            <AppWrapper>
                {this.renderModal()}
                <Router>
                    <Route path={'/'} exact={false} render={({location}) => (
                        <Nav sections={sections} getPath={getPath} currentPage={location.pathname}/>
                    )}/>
                    <Route
                        path={[getPath(':page'), '/']}
                        render={({match}) => {
                            switch(match.params.page) {
                                case 'plates':
                                    return <PageWrapper><Plates status={this.state.status}/></PageWrapper>
                                case '':
                                default:
                                    return <ClearPageWrapper><Home status={this.state.status}/></ClearPageWrapper>
                                break;
                            }
                        }}
                    />
                </Router>
            </AppWrapper>
        )
    }
}