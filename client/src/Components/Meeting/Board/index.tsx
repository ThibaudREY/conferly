import React, { Component }          from 'react';
import CanvasDraw                    from 'react-canvas-draw';
import CommandService                from '../../../Services/Command/command.service';
import { Commands }                  from '../../../Services/Command/Commands/commands.enum';
import { CirclePicker, ColorResult } from 'react-color';
import update                        from 'react-addons-update';
import './index.css';
import { Slider }                    from 'react-compound-slider';
import Handles                       from 'react-compound-slider/Handles';
import { FaEraser, MdClear }         from 'react-icons/all';

interface BoardProps {
}

interface BoardState {
    color: string,
    size: number
}

export default class Board extends Component<BoardProps, BoardState> {

    readonly state = {
        color: '#607d8b',
        size: 12
    };

    private canvasDraw: any;

    constructor(props: BoardProps) {
        super(props);

        CommandService.register(Commands.BOARD_UPDATE, (self: Board, data: string) => {
            this.canvasDraw.loadSaveData(data.substr(30), true);
            console.log(this.canvasDraw);
        });
    }

    private draw() {
        CommandService.broadcast(Commands.BOARD_UPDATE, this.canvasDraw.getSaveData())
    }

    private clear() {
        this.canvasDraw.clear();
        CommandService.broadcast(Commands.BOARD_UPDATE, this.canvasDraw.getSaveData())
    }

    private colorChange(color: ColorResult) {
        this.setState({
            color: update(this.state.color, {$set: color.hex})
        });
    }

    private sizeChange(size: any) {
        this.setState({
            size: update(this.state.size, {$set: size[0]})
        });
    }

    private eraser() {
        this.setState({
            color: update(this.state.color, {$set: '#ffffff'})
        })
    }

    private handle({
                       handle: {id, value, percent},
                       getHandleProps
                   }: any) {
        return (
            <div
                style={{
                    left: `${percent}%`,
                    position: 'absolute',
                    marginLeft: 0,
                    marginTop: 10,
                    zIndex: 2,
                    width: 30,
                    height: 30,
                    border: 0,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    backgroundColor: '#2C4870',
                    color: '#333',
                }}
                {...getHandleProps(id)}
            >
                <div style={{fontFamily: 'Roboto', fontSize: 11, marginTop: 35}}>
                    {value}
                </div>
            </div>
        )
    };

    render() {

        const {color, size} = this.state;

        return (
            <div className='board'>

                <div className="row">
                    <div className="col-4">
                        <div className="row align-items-end">
                            <div className="col-1 offset-10">
                                <div onClick={() => this.clear()} className='wiper'>
                                    <div className='wiper-inner'>
                                        <MdClear/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-4 p-0">
                        <Slider

                            domain={[0, 50]}
                            step={1}
                            mode={2}
                            values={[size]}
                            onChange={this.sizeChange.bind(this)}
                        >
                            <div className='rail'/>
                            <Handles>
                                {({handles, getHandleProps}) => (
                                    <div className="slider-handles">
                                        {handles.map(handle => (
                                            <this.handle
                                                key={handle.id}
                                                handle={handle}
                                                getHandleProps={getHandleProps}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Handles>
                        </Slider>
                    </div>
                    <div className="col-4">
                        <div className="row">
                            <div className="col-1 offset-1">
                                <div onClick={() => this.eraser()}
                                     className={`eraser ${color === '#ffffff' ? 'inuse' : ''}`}>
                                    <div className='eraser-inner'>
                                        <FaEraser/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <CirclePicker color={color}
                              onChangeComplete={this.colorChange.bind(this)}/>
                <div className='row' onMouseUp={() => this.draw()}>
                    <CanvasDraw hideGrid={true} canvasHeight='70vh' canvasWidth='100vw'
                                brushColor={color}
                                brushRadius={size}
                                ref={(canvasDraw: any) => this.canvasDraw = canvasDraw}/>
                </div>
            </div>
        );
    }
}
