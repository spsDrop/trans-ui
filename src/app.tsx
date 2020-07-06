/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import styled from "@emotion/styled";
import Nav from "./nav";
import Home from './pages/home'
import Plates from './pages/plates'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Modal from './modal'
import Loader from './loader'
import PrintStatus from './printStatus'
import {HorizontalGroup, Details, Detail, singleColumnBreak} from './commonStyledComponents'

import type {NavSection} from './nav'

const AppWrapper = styled.div`
    min-height: 100vh;
    min-width: 680px;
    background: top right no-repeat url('/assets/images/demo/home/home-banner.jpg') #0D031A;
    background-size: 175% auto;
    padding: 5rem 5rem;
    box-sizing: border-box;
    @media (max-width: ${singleColumnBreak}) {
        padding: 5rem 2rem;
    }
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

export type PrintStatus = {
    PRINTING: boolean,
    PLATE_NAME: string,
    PLATE_ID: number,
    RESSIN_NAME: string,
    LAYER: number,
    LAYER_TOT: number,
    REMAIN: number,
    ISPAUSE: boolean,
}

export type AppStatus = {
    cpuLoad?: number,
    diskUsage?: number,
    cpuTemp?: number,
    uptime?: number,
    printStatus?: PrintStatus,
    version?: string,
    language?: string,
    processingUpload?: boolean,
    processingStatus?: string,
    printInitializing?: boolean
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
            then((data: AppStatus) => {
                /*
                // Dummy data for testing print status
                data.printStatus = {
                    ISPAUSE: false,
                    PRINTING: true,
                    PLATE_ID: 15938190127,
                    PLATE_NAME: 'Example_Print with a super long file name.zip',
                    LAYER: 1,
                    LAYER_TOT: 2399,
                    REMAIN: 43500,
                    RESSIN_NAME: 'Water Washable'
                }
                */
                this.setState({
                    status: data
                })
            })
    }

    renderModal() {
        const {
            processingUpload,
            processingStatus,
            printInitializing,
            printStatus
        } = this.state.status
        if (processingUpload) {
            return (
                <Modal shown={true}>
                    <HorizontalGroup>
                    <Details css={css({paddingRight: "1.5rem"})}>
                        <Detail size="large">Processing Upload</Detail>
                        <Detail size="small">Please wait while the upload is processed. This can take a few minutes.</Detail>
                        <Detail size="small"><strong>Do not refresh the page</strong>.</Detail>
                        <Detail>Current Status: {processingStatus}</Detail>
                    </Details>
                    <Details>
                        <Loader size={5}/>
                    </Details>
                    </HorizontalGroup>
                </Modal>
            )
        }
        if (printInitializing || printStatus?.PRINTING) {
            return (
                <Modal shown={true}>
                    <PrintStatus
                        status={this.state.status}
                        updateStatus={() => this.updateStatus()}
                    />
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