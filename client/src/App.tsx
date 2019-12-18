import 'reflect-metadata';
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from './Components/HomePage';
import Meeting from './Components/Meeting';
import ErrorModal from './Services/error-modal.service';
import DestineeModal from './Components/Meeting/FileDrop/file-destinee-modal';
import SplashScreen from './Components/Splash';

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route exact path='/'>
                        <HomePage />
                    </Route>
                    <Route path='/:roomId' component={Meeting} />
                </Switch>
                <SplashScreen />
            </Router>

            <DestineeModal />
            <ErrorModal />

        </div>
    );
}

export default App;
