import styled from "@emotion/styled"

export const singleColumnBreak = '1100px'

export const HorizontalGroup = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
`;
export const ContainerBox = styled.div`
    background-color: rgba(64, 64, 64, 0.9);
    padding: 2rem;
    border-radius: 0.35rem;
    margin-bottom: 2rem;
    color: white;
    :last-child {
        @media (min-width: ${singleColumnBreak}) {
            margin-bottom: 0;
        }
    }
`

export const Details = styled.div<{hidden?: boolean,align?: string}>`
    display: ${props => props.hidden ? 'none' : 'block'};
    text-align: ${props => props.align || 'left'};
`
export const Detail = styled.div<{hidden?: boolean, size?: string}>`
    display: ${props => props.hidden ? 'none' : 'block'};
    font-size: ${props =>{
        switch(props.size) {
            case "small":
                return .8
            case "large":
                return 1.8
            default:
                return 1.25
        }
    }}rem;
    margin-bottom: 1rem;
    margin-right: 0.5rem;
    :last-child {
        margin-bottom: 0;
        margin-right: 0;
        
    }
`

export const getButtonColors = (hue) => `
    background-color: hsl(${hue}, 80%, 30%);
    border-color: hsl(${hue}, 80%, 15%);
    text-shadow: 0.125rem 0.125rem 2px hsl(${hue}, 80%, 15%);
    :hover {
        box-shadow:
            0 0 0.5rem hsla(${hue}, 80%, 50%, 0.5),
            inset 0 0 1.6rem hsl(${hue}, 80%, 50%);
    }
`

interface AsAble {
    as?: React.ElementType | keyof JSX.IntrinsicElements;
    hidden?: boolean;
}
export const Button = styled.button<AsAble>`
    display: ${props => props.hidden ? 'none' : 'inline-block'};
    color: white;
    border: 0;
    border-radius: 0.5rem;
    padding: 0.6rem 1rem;
    font-size: 1.25rem;
    margin-right: 0.6rem;
    margin-bottom: 1rem;
    position: relative;
    border: none;
    border-bottom: 0.125rem solid;
    border-right: 0.125rem solid;
    cursor: pointer;

    :hover {
        text-decoration: none;
        outline: none;
        box-shadow: inset 0 0 3rem;
    }

    :focus {
        outline: none;
    }

    ${getButtonColors(216)}

    :active {
        border-color: transparent;
        transform: translate(0.125rem, 0.125rem);
    }

    &[disabled] {
        pointer-events: none;
        background-color: #667a99;
        :focus, :hover {
            box-shadow: none;
        }
    }

    select& {
        padding-right: 2.5rem;
        appearance: none;
        background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
        background-repeat: no-repeat;
        background-position-x: calc(100% - 0.5rem);
        background-position-y: 50%;

        option:focus, option:hover{
            border-radius: 0.5rem;
            outline: none;
        }
    }

    :last-child {
        margin-right: 0rem;
    }
`
export const GreenButton = styled(Button)`
    ${getButtonColors(145)}
`
export const RedButton = styled(Button)`
    ${getButtonColors(10)}
`


export const PreviewWrap = styled.div<{previewUrl: string}>`
    background: center center url(${props => props.previewUrl}) no-repeat;
    background-size: cover;
    position: relative;
    margin-bottom: 1rem;
    width: 100%;
    padding-top: 57.25%;
    border-radius: 0.25rem;
    overflow: hidden;
    img {
        transition: opacity 250ms ease-out;
        opacity: 0;
    }
    :hover img, :focus img {
        opacity: 1;
    }
`
export const PreviewDetail = styled(ContainerBox)`
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    padding: 0.75rem;
    background-color: rgba(16, 16, 16, 0.9);
`
export const Preview = styled.img`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`