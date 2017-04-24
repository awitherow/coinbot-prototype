const React = require('react');
const blessed = require('blessed');
const { render } = require('react-blessed');
const { attemptRun } = require('./bot');

// Rendering a simple centered box
class App extends React.Component {
    render() {
        return (
            <box
                top="center"
                left="center"
                width="99%"
                height="99%"
                border={{ type: 'line' }}
                style={{ border: { fg: 'blue' } }}
            >
                {attemptRun()}
            </box>
        );
    }
}

// Creating our screen
const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    title: 'coinbot',
});

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Rendering the React app using our screen
const component = render(<App />, screen);
