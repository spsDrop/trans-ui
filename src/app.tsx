import * as React from 'react'
import styled from "@emotion/styled";
import Nav from "./nav";
import Home from './pages/home'
import {BrowserRouter as Router, Route} from 'react-router-dom'

import type {NavSection} from './nav'

const AppWrapper = styled.div`
    min-height: 100vh;
    background: top right no-repeat url('/assets/images/demo/home/home-banner.jpg');
    background-size: cover;
`
const ClearPageWrapper = styled.div`
    padding: 5rem 5rem;
`

const PageWrapper = styled(ClearPageWrapper)``


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
    printStatus?: object
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
                this.setState({
                    status: data
                })
            })
    }

    render(){
        return (
            <AppWrapper>
                <Router>
                    <Route path={'/'} exact={false} render={({match}) => (
                        <Nav sections={sections} getPath={getPath} currentPage={match.params.page}/>
                    )}/>
                    <Route
                        path={['/', getPath(':page')]}
                        render={({match}) => {
                            switch(match.params.page) {
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