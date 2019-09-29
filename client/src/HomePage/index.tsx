import React    from 'react';
import './index.css';
import Controls from './Controls';

const HomePage: React.FC = () => {
    return (
        <div className='container'>
            <img className='logo' src={'./logo.svg'} alt=""/>
            <img className="background" src={'./background.jpg'} alt=''/>
            <div className='screen'>
                <p className='speech'>A Peer to Peer server less in browser solution guarantying privacy and flexibility for your meetings</p>
                <Controls/>
            </div>
        </div>
    );
}

export default HomePage;
