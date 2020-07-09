/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import * as React from 'react'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import styled from "@emotion/styled"
import { AppStatus, getPath } from '../app'
import { secondsToTimeString, calculatePrintTime } from "../utils/time";
import { Detail, Details, HorizontalGroup, ContainerBox, PreviewWrap, Preview, PreviewDetail, Button, RedButton, GreenButton, singleColumnBreak, getButtonColors } from '../commonStyledComponents'
import Modal from '../modal'
import axios from 'axios'

const Grid = styled(HorizontalGroup)`
    flex-wrap: wrap;
`

const DeleteButton = RedButton.withComponent(Link)

const Field = styled(Button.withComponent('input'))<{length?: string}>`
    width: ${props => props.length === 'long' ? '100%' : '8.5rem'};
`

const BurnField = styled(Field)`
    ${getButtonColors(302)}
`

const NormalField = styled(Field)`
    ${getButtonColors(135)}
`

const sanitizeField = (name, value) => {
    if(name === 'Z') {
        return parseFloat(value)
    } else if (name === 'name') {
        return String(value)
    } else {
        return parseInt(value, 10)
    }
}

type Props = {
    status: AppStatus
}

type State = {
    profiles: ResinProfile[]
}

export type ResinProfile =   {
    Z: string,
    burnCure: number,
    burnLayer: number,
    burn_pull_speed: number,
    burn_pull_z: number,
    id: number,
    led_delay: number,
    name: string,
    normalCure: number,
    pull_speed: number,
    pull_z: number,
    push_speed: number
}

export default class ProfileView extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            profiles: []
        }
    }

    componentDidMount() {
        this.updateResin();
    }

    updateResin() {
        fetch('/api/resin?cache='+Date.now()).
            then(res => res.json()).
            then((data: ResinProfile[]) => {
                this.setState({
                    profiles: data
                })
            })
    }

    profilesToUpdate = {}
    changeTimer = undefined
    flushing = false

    changeHandler(e: React.ChangeEvent<HTMLFormElement>, profileId) {
        this.profilesToUpdate[profileId] = this.profilesToUpdate[profileId] || {};
        this.profilesToUpdate[profileId][e.target.name] = sanitizeField(e.target.name, e.target.value)
        if (!this.flushing) {
            this.scheduleFlush()
        }
    }

    scheduleFlush() {
        if (this.changeTimer) {
            clearTimeout(this.changeTimer)
        }
        this.changeTimer = setTimeout(()=> this.flushChanges(), 1000)
    }

    flushChanges() {
        this.changeTimer = undefined
        this.flushing = true
        const profilesToFlush = this.profilesToUpdate
        this.profilesToUpdate = {}

        const chainFlush = () => {
            if (!!Object.keys(this.profilesToUpdate).length) {
                this.scheduleFlush()
            }
        }

        Object.keys(profilesToFlush).forEach((profileId) => {
            axios.post(
                `/api/resin/update/${profileId}`,
                profilesToFlush[profileId]
            ).
            then(res => {
                if (res.data.success){
                    this.updateResin()
                } else {
                    console.error(res.data.message);
                    this.profilesToUpdate = {...this.profilesToUpdate, ...profilesToFlush}
                }
                this.flushing = false;
                chainFlush()
            }).
            catch(error => {
                console.log(error)
                this.flushing = false;
                chainFlush()
            })
        })
    }

    duplicateProfile(profile){
        const newData = {...profile, name: profile.name+' Copy'}
        axios.post(
            '/api/resin/create',
            newData
        ).then(res => {
            if (res?.data?.success) {
                this.updateResin()
            } else {
                console.error(res.data.message);
            }
        }).
        catch(error => {
            console.log(error)
        })
    }

    deleteProfile(profileId){
        axios.post(
            `/api/resin/delete/${profileId}`
        ).then(res => {
            if (res?.data?.success) {
                this.updateResin()
            } else {
                console.error(res.data.message);
            }
            this.cancelModal()
        }).
        catch(error => {
            console.log(error)
            this.cancelModal()
        })
    }

    downloadProfile(content, fileName) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href)
    }

    cancelModal() {
        history.replaceState({}, '', getPath('profiles'))
        history.back()
    }

    renderProfile(profile: ResinProfile) {
        return (
            <ContainerBox key={profile.id}>
                <form onChange={e => this.changeHandler(e, profile.id)}>
                <Field type="text" length="long" name="name" defaultValue={profile.name}/>
                <HorizontalGroup>
                    <Detail>
                        <Detail size="small">Thickness (mm)</Detail>
                        <Detail><Field min={0} step={0.01} type="number" name="Z" defaultValue={profile.Z}/></Detail>
                    </Detail>
                    <Detail>
                        <Detail size="small">DownSpeed</Detail>
                        <Detail><Field min={0} step={10} type="number" name="push_speed" defaultValue={profile.push_speed}/></Detail>
                    </Detail>
                    <Detail>
                        <Detail size="small">LED Delay (ms)</Detail>
                        <Detail><Field min={0} step={100} type="number" name="led_delay" defaultValue={profile.led_delay}/></Detail>
                    </Detail>
                </HorizontalGroup>
                <Detail>
                    Burn Layers Count <BurnField css={css`margin-left: 0.5rem; width: 5rem;`} min={0} type="number" name="burnLayer" defaultValue={profile.burnLayer}/>
                </Detail>
                <HorizontalGroup>
                    <Detail>
                        <Detail size="small">Burn Cure Time (ms)</Detail>
                        <Detail><BurnField min={0} step={1000} type="number" name="burnCure" defaultValue={profile.burnCure}/></Detail>
                    </Detail>
                    <Detail>
                        <Detail size="small">Burn Lift Height (mm)</Detail>
                        <Detail><BurnField min={0} type="number" name="burn_pull_z" defaultValue={profile.burn_pull_z}/></Detail>
                    </Detail>
                    <Detail>
                        <Detail size="small">Burn Lift Speed</Detail>
                        <Detail><BurnField min={0} step={10} type="number" name="burn_pull_speed" defaultValue={profile.burn_pull_speed}/></Detail>
                    </Detail>
                </HorizontalGroup>
                <Detail>
                    Normal Layers
                </Detail>
                <HorizontalGroup>
                    <Detail>
                        <Detail size="small">Cure Time (ms)</Detail>
                        <Detail><NormalField min={0} step={1000} type="number" name="normalCure" defaultValue={profile.normalCure}/></Detail>
                    </Detail>
                    <Detail>
                        <Detail size="small">Lift Height (mm)</Detail>
                        <Detail><NormalField min={0} name="pull_z" type="number" defaultValue={profile.pull_z}/></Detail>
                    </Detail>
                    <Detail>
                        <Detail size="small">Lift Speed</Detail>
                        <Detail><NormalField min={0} step={10} type="number" name="pull_speed" defaultValue={profile.pull_speed}/></Detail>
                    </Detail>
                </HorizontalGroup>
                </form>
                <Detail css={css`color: #aaa;`}>
                    Print time for 1000 layer file: {secondsToTimeString(calculatePrintTime(profile, 1000))}
                </Detail>
                <Details>
                    <Button onClick={()=> this.duplicateProfile(profile)}>
                        Duplicate
                    </Button>
                    <GreenButton onClick={()=> this.downloadProfile(JSON.stringify(profile), profile.name+'.json')}>
                        Export
                    </GreenButton>
                    {( profile.id !== 1 &&
                        <DeleteButton to={getPath(`profiles/delete/${profile.id}`)}>
                            Delete
                        </DeleteButton>
                    )}
                </Details>
            </ContainerBox>
        )
    }

    render() {
        const {
            profiles
        } = this.state;
        return (
            <Router>
                <Route 
                    path={getPath('profiles/delete/:profileId')}
                    render={({match:{params:{profileId}}}) => {
                        return (
                            <Modal shown={true}>
                                <Detail>Are you sure your want to delete this profile?</Detail>
                                <Details align="right">
                                    <Button css={css({marginBottom: 0})} onClick={()=> this.cancelModal()}>Cancel</Button>
                                    <RedButton css={css({marginBottom: 0})} onClick={()=> this.deleteProfile(profileId)}>Delete</RedButton>
                                </Details>
                            </Modal>
                        )
                    }}
                />
                <Grid>
                    {profiles && profiles.map(profile => this.renderProfile(profile))}
                    <ContainerBox>

                    </ContainerBox>
                </Grid>
            </Router>
        )
    }
}