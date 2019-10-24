import 'reflect-metadata';
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from './Components/HomePage';
import Meeting from './Components/Meeting';
import ErrorModal from './Services/error-modal.service';

const App: React.FC = () => {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route exact path='/'>
                        <HomePage />
                    </Route>
                    <Route path='/:roomId' component={Meeting} />
                </Switch>
            </Router>

            <ErrorModal />
        </div>
    );
}

export default App;
