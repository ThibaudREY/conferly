import { BehaviorSubject } from 'rxjs';
import React, { useEffect, useState } from 'react';
import RotateLoader from 'react-spinners/RotateLoader';
import './index.css';
import { withRouter, RouteComponentProps } from 'react-router-dom';

export const splashSreen = new BehaviorSubject({
    show: false,
    message: '',
});

interface SplashScreenProps extends RouteComponentProps<any> {

}

const SplashScreen: React.FC<SplashScreenProps> = (props: SplashScreenProps) => {

    const [showSplash, setShowSplash] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        splashSreen.subscribe(splash => {
            setShowSplash(splash.show);
            setMessage(splash.message);
        });

        // this line is due to recursive re-render useEffect with timer above
        return () => {
        }
    }, []);

    return (
        showSplash ?
            <div className="splash-container">
                <RotateLoader color={"white"} loading={showSplash} />
                <h4 className="loading-title mt-4 text-white">
                    Connecting to conference {props.location.pathname.substring(1)}
                </h4>
                <h6 className="loading-message text-white">
                    {message}
                </h6>
            </div> : null
    );
};

export default withRouter(SplashScreen);
