'use strict';

// Boilerplate
import React, { Component } from "react";
import { hot } from "react-hot-loader";

// CSS for this component
import "./App.css";

// Supporting components
import Clock from "./components/clock/clock.js";
import Separator from "./components/separator/separator.js";
import I3 from "./components/i3/i3.js";

class App extends Component {
    render(){
        return(
            <div className="App">
                <I3/>
                <Separator/>
                <Clock/>
            </div>
        );
    }
}

export default hot(module)(App);
