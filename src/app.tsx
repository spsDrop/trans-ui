import * as React from 'react'
import styled from "@emotion/styled";
import Nav from "./nav";

import type {NavSection} from './nav'

const AppWrapper = styled.div`
    min-height: 100vh;
    background: top right no-repeat url('/assets/images/demo/home/home-banner.jpg');
    background-size: cover;
`


const sections:Array<NavSection> = [
    {
        name: 'PLATES',
        location: '/plates'
    }
]

export default class TransUIApp extends React.Component {
    render(){
        return (
            <AppWrapper>
                <Nav sections={sections}/>
            </AppWrapper>
        )
    }
}