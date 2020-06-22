import * as React from 'react'
import styled from '@emotion/styled'
import {Link} from 'react-router-dom'

const navHeight = '3rem'

const NavWrapper = styled('div')`
    position: fixed;
    width: 100%;
    border-top: 0.5rem #19263a solid;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: rgba(27, 37, 77, 0.35);
    padding: 0.5rem 2rem;
    box-sizing: border-box;
`

const Logo = styled('img')`
    height: ${navHeight};
    
`

const Sections = styled('div')`
    display: flex;
    flex-direction: row;
`

const Section = styled(Link)`
    font-size: 0.8rem;
    color: white;
    letter-spacing: 0.2rem;
    line-height: ${navHeight};
    box-sizing: border-box;
    font-weight: bold;
    position: relative;
    margin-left: 3rem;
    :hover {
        text-decoration: none;
    }
    :after {
        content: ' ';
        bottom: 0;
        left: 0;
        width:100%;
        height: 0;
        background: #FF1493;
        transition: height 0.25s ease-out;
        position: absolute;
    }
    :hover:after {
        height: 0.25rem;
    }
`

export type NavSection = {
    name: string,
    page: string
}

type props = {
    currentPage: string,
    sections: Array<NavSection>,
    getPath: (path:string) => string
}

export default class Nav extends React.Component<props>{
    render() {
        return (
            <NavWrapper>
                <Link to={this.props.getPath('')}>
                    <Logo src="/assets/images/static/phrozen_logo_w.png"/>
                </Link>
                <Sections>
                    {
                        this.props.sections.map( (section:NavSection) => (
                            <Section to={this.props.getPath(section.page)}>
                                {section.name}
                            </Section>
                        ))
                    }
                </Sections>
            </NavWrapper>
        )
    }
}