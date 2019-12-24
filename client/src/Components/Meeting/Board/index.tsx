import React, { Component } from 'react';
import CanvasDraw from 'react-canvas-draw';
import CommandService from '../../../Services/Command/command.service';
import { Commands } from '../../../Services/Command/Commands/commands.enum';
import { CirclePicker, ColorResult } from 'react-color';
import update from 'react-addons-update';
import './index.css';
import { Slider } from 'react-compound-slider';
import Handles from 'react-compound-slider/Handles';
import { FaEraser, MdClear } from 'react-icons/all';
import { injector } from '../../..';
import { BehaviorSubject } from 'rxjs';

interface BoardProps {
    visible: boolean,
}

interface BoardState {
    color: string,
    size: number
}

export const board = new BehaviorSubject<any>({});

export default class Board extends Component<BoardProps, BoardState> {

    readonly state = {
        color: '#607d8b',
        size: 5
    };

    private commandService: CommandService = injector.get(CommandService);

    constructor(props: BoardProps) {
        super(props);

        this.commandService.register(Commands.BOARD_UPDATE, (self: Board, data: string) => {
            board.value.loadSaveData(data.substr(30), true);
        });
    }

    private draw() {
        this.commandService.broadcast(Commands.BOARD_UPDATE, board.value.getSaveData())
    }

    private clear() {
        board.value.clear();
        this.commandService.broadcast(Commands.BOARD_UPDATE, board.value.getSaveData())
    }

    private colorChange(color: ColorResult) {
        this.setState({
            color: update(this.state.color, { $set: color.hex })
        });
    }

    private sizeChange(size: any) {
        this.setState({
            size: update(this.state.size, { $set: size[0] })
        });
    }

    private eraser() {
        this.setState({
            color: update(this.state.color, { $set: '#ffffff' })
        })
    }

    private handle({
        handle: { id, value, percent },
        getHandleProps
    }: any) {
        return (
            <div
                style={{
                    left: `${percent}%`,
                    position: 'absolute',
                    marginLeft: 0,
                    marginTop: -13,
                    zIndex: 2,
                    width: 25,
                    height: 25,
                    border: 0,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    backgroundColor: '#2C4870',
                    color: '#333',
                }}
                {...getHandleProps(id)}
            >
                <div style={{ fontFamily: 'Roboto', fontSize: 11, marginTop: 35 }}>
                    {value}
                </div>
            </div>
        )
    };

    render() {

        const { color, size } = this.state;

        return (
            this.props.visible ?

                <div className='board'>

                    <div className="row">
                        <div className="col-2 offset-5 p-0 align-self-center">
                            <Slider

                                domain={[0, 50]}
                                step={1}
                                mode={2}
                                values={[size]}
                                onChange={this.sizeChange.bind(this)}
                            >
                                <div className='rail' />
                                <Handles>
                                    {({ handles, getHandleProps }) => (
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
                        <div className="col-2 align-self-center d-flex justify-content-start">
                            <div onClick={() => this.eraser()}
                                className={`eraser ${color === '#ffffff' ? 'inuse' : ''}`}>
                                <div className='eraser-inner'>
                                    <FaEraser />
                                </div>
                            </div>
                            <div onClick={() => this.clear()} className='wiper'>
                                <div className='wiper-inner ml-3'>
                                    <MdClear />
                                </div>
                            </div>
                        </div>
                        <div className="col-3 d-flex justify-content-end mt-2">
                            <CirclePicker color={color}
                                circleSize={20}
                                circleSpacing={8}
                                onChangeComplete={this.colorChange.bind(this)} />
                        </div>
                    </div>


                    <div className='row' onMouseUp={() => this.draw()}>
                        <CanvasDraw hideGrid={true} canvasHeight='65vh' canvasWidth='100vw'
                            brushColor={color}
                            brushRadius={size}
                            ref={(canvasDraw: any) => board.next(canvasDraw)} />
                    </div>
                </div> : null
        );
    }
}
