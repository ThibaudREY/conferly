import 'reflect-metadata';
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from './Components/HomePage';
import Meeting from './Components/Meeting';

const App: React.FC = () => {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route path='/:roomId' component={Meeting} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
