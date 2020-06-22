import * as React from 'react'
import ReactDOM from 'react-dom';
import TransUIApp from './app'

const app = (<TransUIApp/>);

window.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        app,
        document.getElementById('appRoot')
    )
});
