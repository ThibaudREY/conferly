import React, { useEffect, useState } from "react";
import './index.css';
import { FaTimes }                    from 'react-icons/all';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            console.log("we are being triggered :D");
            setSupportsPWA(true);
            setPromptInstall(e as any);
            if (window.matchMedia('(display-mode: standalone)').matches) {
                setShow(false);
            }
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("transitionend", handler);
    }, []);

    const onClick = (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        setShow(false);
        (promptInstall as any).prompt();
    };
    if (!supportsPWA) {
        return null;
    }
    return show ?
        <div className='pwa-install-footer text-center'>
            <div className="close m-2 clickable" onClick={_ => setShow(false)}>
                <FaTimes size={30} color='black'/>
            </div>
            <div className="row m-0 p-2" >
                <div className="pwa-logo">
                    <img className='rounded-circle w-100' src={`${process.env.PUBLIC_URL}/logo512.png`} alt="Conferly"/>
                </div>
                <div className="col-10 d-flex justify-content-center flex-column text-muted text-left">
                    <h1 className='text-left font-weight-bold'>Conferly Progressive Web App</h1>
                    <p className='text-muted text-left'>
                        Conferly also comes as a progressive web app
                    </p>
                    Add it to your home screen
                </div>
            </div>
            <div className="pwa-button p-3" onClick={onClick}>
                + ADD TO HOME SCREEN
            </div>
        </div>
     : null;
};

export default InstallPWA;
