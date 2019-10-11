import React from 'react';
import './index.css';
import Controls from './Controls';


const HomePage: React.FC = () => {
    return (
        <div id="home">
            <div id="header">
                <nav className="navbar navbar-light fixed-top gradient-background">
                    <a className="navbar-brand text-white" href="/">
                        <img className="app-logo" src={process.env.PUBLIC_URL + "/app-logo.png"} alt="conferly logo"></img>
                    </a>
                </nav>
            </div>
            <div className="row vh-100 gradient-background m-0">
                <div className="col-sm-7 align-self-center text-center intro">
                    <h1 className="text-white main-title">We <del>hate</del> love the scrum events.</h1>
                    <h4 className="text-white second-title">Get everything in one place from your office white-board to your Git branches using Conferly</h4>
                    <div className="start">
                        <Controls />
                    </div>
                </div>
                <div className="col-sm-5">
                    <img className="home-image" src={process.env.PUBLIC_URL + '/home-image.png'} alt="scrum meeting"></img>
                </div>
                <div className="col-sm-12 pr-0 pl-0">
                    <div className="wave-container">
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
